import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    signInAnonymously,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/index";
import type { UserProfile } from "../types";
import preset01 from '../components/profile-presets/preset-01.png';

// --- Helper: Create Default Profile ---
const createDefaultProfile = (user: User, isGuest: boolean = false, email: string = ''): UserProfile => {
    const username = email ? email.split('@')[0] : `guest_${user.uid.slice(0, 6)}`;
    return {
        uid: user.uid,
        name: isGuest ? 'Guest Trader' : username,
        displayName: isGuest ? 'Guest' : username,
        username: isGuest ? `guest_${Math.floor(Math.random() * 10000)}` : username.replace(/[^a-zA-Z0-9]/g, ''),
        email: email || '',
        avatar: preset01,
        bio: isGuest ? 'Just visiting.' : '',
        country: 'US',
        experience: 'Beginner',
        onboardingCompleted: false,
        isGuest: isGuest,
        createdAt: new Date(),
        lastLogin: new Date(),
        groupsJoined: [],
        traderLabProgress: {},
        stats: {
            analysesRun: 0,
            chartsUploaded: 0,
            groupsJoined: 0,
            xp: 0,
            rank: 'Bronze',
            badges: [],
            balance: 10000,
            pnl: 0
        }
    };
};

// --- Sign Up with Email & Password ---
export const signUpWithEmailPassword = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const newProfile = createDefaultProfile(user, false, email);

        await setDoc(doc(db, 'users', user.uid), {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });

        localStorage.setItem('tradesnap_uid', user.uid);
        return newProfile;
    } catch (error: any) {
        console.error('Signup error:', error);
        throw new Error(mapAuthError(error.code));
    }
};

// --- Login with Email & Password ---
export const loginWithEmailPassword = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return await handleUserLogin(result.user);
    } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(mapAuthError(error.code));
    }
};

// --- Guest Login ---
export const loginAsGuest = async (): Promise<UserProfile> => {
    try {
        const result = await signInAnonymously(auth);
        return await handleUserLogin(result.user, true);
    } catch (error: any) {
        console.error('Guest login error:', error);
        throw new Error(mapAuthError(error.code));
    }
};

// --- Password Reset ---
export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error('Password reset error:', error);
        throw new Error(mapAuthError(error.code));
    }
};

// --- Common Login Handler ---
const handleUserLogin = async (user: User, isGuest: boolean = false): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let profile: UserProfile;

    if (userDoc.exists()) {
        const data = userDoc.data();
        profile = {
            uid: user.uid,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            lastLogin: new Date()
        } as UserProfile;

        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
    } else {
        profile = createDefaultProfile(user, isGuest, user.email || '');
        await setDoc(userDocRef, {
            ...profile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });
    }

    localStorage.setItem('tradesnap_uid', user.uid);
    return profile;
};

// --- Session Management ---
export const handleSignOut = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('tradesnap_uid');
        localStorage.removeItem('tradesnap_user_profile');
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

export const checkSession = async (): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                const profile = await handleUserLogin(user, user.isAnonymous);
                resolve(profile);
            } else {
                resolve(null);
            }
        });
    });
};

// --- Error Mapping ---
const mapAuthError = (code: string): string => {
    switch (code) {
        case 'auth/invalid-email': return 'Invalid email address.';
        case 'auth/user-disabled': return 'Account disabled.';
        case 'auth/user-not-found': return 'No account found.';
        case 'auth/wrong-password': return 'Incorrect password.';
        case 'auth/email-already-in-use': return 'Email already in use.';
        case 'auth/weak-password': return 'Password too weak.';
        case 'auth/operation-not-allowed': return 'Operation not allowed.';
        default: return 'Authentication failed.';
    }
};
