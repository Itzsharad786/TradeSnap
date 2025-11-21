const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

admin.initializeApp();

const db = admin.firestore();

// IMPORTANT: Configure your environment variables for nodemailer.
// In your terminal, run:
// firebase functions:config:set smtp.host="your-smtp-host" smtp.port="587" smtp.user="your-smtp-user" smtp.pass="your-smtp-password"
const smtpConfig = functions.config().smtp;

if (!smtpConfig || !smtpConfig.host) {
  console.warn("SMTP configuration not set. Email functionality will not work.");
}

const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: parseInt(smtpConfig.port || "587", 10),
  secure: parseInt(smtpConfig.port || "587", 10) === 465,
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.pass,
  },
});

const OTP_EXPIRATION_MINUTES = 5;

/**
 * Generates, stores, and emails a 6-digit OTP.
 */
exports.sendOtp = functions.https.onCall(async (data, context) => {
  if (!smtpConfig || !smtpConfig.host) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The email service is not configured.",
    );
  }

  const {email} = data;
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
    return {success: true, message: "OTP sent successfully."};
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", "Failed to send OTP email.");
  }
});


/**
 * Verifies an OTP and returns a custom auth token if valid.
 */
exports.verifyOtp = functions.https.onCall(async (data, context) => {
  const {email, otp} = data;
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
  const {otpHash} = otpDoc.data();
  const isValid = await bcrypt.compare(otp, otpHash);

  if (!isValid) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid OTP.");
  }

  await otpDoc.ref.update({used: true});

  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      user = await admin.auth().createUser({email});
    } else {
      console.error("Auth error:", error);
      throw new functions.https.HttpsError("internal", "Authentication error.");
    }
  }

  const customToken = await admin.auth().createCustomToken(user.uid);
  return {token: customToken};
});
