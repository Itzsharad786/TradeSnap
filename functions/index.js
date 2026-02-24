const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const https = require("https");

admin.initializeApp();

const db = admin.firestore();

// ============================================================
// REAL-TIME STOCK PRICE FUNCTION (Yahoo Finance - No API Key)
// ============================================================
exports.getStockPrice = functions.https.onCall(async (data) => {
  const { symbol } = data;
  if (!symbol) {
    throw new functions.https.HttpsError("invalid-argument", "Symbol is required.");
  }

  // Yahoo Finance v8 chart API — free, no key, works for stocks/crypto/forex
  // Forex: USDJPY=X, Crypto: BTC-USD, Stocks: TSLA, RELIANCE.NS etc.
  const yahooSymbol = symbol.toUpperCase();
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    }, (res) => {
      let rawData = "";
      res.on("data", (chunk) => rawData += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(rawData);
          const result = parsed?.chart?.result?.[0];
          if (!result) {
            reject(new functions.https.HttpsError("not-found", `No data found for symbol: ${yahooSymbol}`));
            return;
          }
          const meta = result.meta;
          const regularMarketPrice = meta.regularMarketPrice;
          const previousClose = meta.chartPreviousClose || meta.previousClose || regularMarketPrice;
          const change = regularMarketPrice - previousClose;
          const changePercent = ((change / previousClose) * 100);
          const currency = meta.currency || "USD";

          resolve({
            symbol: yahooSymbol,
            name: meta.longName || meta.shortName || yahooSymbol,
            price: regularMarketPrice,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            currency,
            dayHigh: meta.regularMarketDayHigh || regularMarketPrice,
            dayLow: meta.regularMarketDayLow || regularMarketPrice,
            volume: meta.regularMarketVolume || 0,
            marketCap: meta.marketCap || null,
            exchange: meta.exchangeName || "",
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
          });
        } catch (e) {
          reject(new functions.https.HttpsError("internal", "Failed to parse Yahoo Finance response."));
        }
      });
    });

    req.on("error", (e) => {
      reject(new functions.https.HttpsError("internal", `Request failed: ${e.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new functions.https.HttpsError("deadline-exceeded", "Yahoo Finance request timed out."));
    });
  });
});

// ============================================================
// EXISTING EMAIL (OTP) FUNCTIONS — UNCHANGED
// ============================================================
const smtpConfig = functions.config().smtp || {};

if (!smtpConfig || !smtpConfig.host) {
  console.warn("SMTP configuration not set. Email functionality will not work.");
}

const transporter = smtpConfig.host ? nodemailer.createTransport({
  host: smtpConfig.host,
  port: parseInt(smtpConfig.port || "587", 10),
  secure: parseInt(smtpConfig.port || "587", 10) === 465,
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.pass,
  },
}) : null;

const OTP_EXPIRATION_MINUTES = 5;

exports.sendOtp = functions.https.onCall(async (data, context) => {
  if (!smtpConfig || !smtpConfig.host) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The email service is not configured.",
    );
  }

  const { email } = data;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid 'email' argument.",
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000,
  );

  await db.collection("otps").add({
    email,
    otpHash,
    expiresAt,
    used: false,
  });

  const mailOptions = {
    from: `"Tradesnap" <${smtpConfig.user}>`,
    to: email,
    subject: "Your Tradesnap Login Code",
    text: `Your one-time password is: ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.`,
    html: `<p>Your one-time password is: <b>${otp}</b>. It expires in ${OTP_EXPIRATION_MINUTES} minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", "Failed to send OTP email.");
  }
});


exports.verifyOtp = functions.https.onCall(async (data, context) => {
  const { email, otp } = data;
  if (!email || !otp || otp.length !== 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function requires 'email' and a 6-digit 'otp'.",
    );
  }

  const now = admin.firestore.Timestamp.now();
  const query = db.collection("otps")
    .where("email", "==", email)
    .where("expiresAt", ">", now)
    .where("used", "==", false)
    .orderBy("expiresAt", "desc")
    .limit(1);

  const snapshot = await query.get();

  if (snapshot.empty) {
    throw new functions.https.HttpsError("not-found", "Invalid or expired OTP.");
  }

  const otpDoc = snapshot.docs[0];
  const { otpHash } = otpDoc.data();
  const isValid = await bcrypt.compare(otp, otpHash);

  if (!isValid) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid OTP.");
  }

  await otpDoc.ref.update({ used: true });

  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      user = await admin.auth().createUser({ email });
    } else {
      console.error("Auth error:", error);
      throw new functions.https.HttpsError("internal", "Authentication error.");
    }
  }

  const customToken = await admin.auth().createCustomToken(user.uid);
  return { token: customToken };
});
