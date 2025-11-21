import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile } from "../types";

// Sign Up with Email & Password
export const signUpWithEmailPassword = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const username = email.split('@')[0];

        // Create new user profile
        const newProfile: UserProfile = {
            uid: user.uid,
            name: username,
            displayName: username,
            username: username.replace(/[^a-zA-Z0-9]/g, ''),
            email: email,
            avatar: 'trader-1',
            bio: '',
            country: 'US',
            experience: 'Beginner',
            onboardingCompleted: false,
            isGuest: false,
            createdAt: new Date(),
            lastLogin: new Date(),
            theme: 'dark',
            themeColor: '#0ea5e9',
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

        // Save profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });

        // Save session
        localStorage.setItem('tradesnap_uid', user.uid);
        localStorage.setItem('tradesnap_email', email);

        return newProfile;
    } catch (error: any) {
        console.error('Signup error:', error);
        throw new Error(mapAuthError(error.code));
    }
};

// Login with Email & Password
export const loginWithEmailPassword = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        let profile: UserProfile;

        if (userDoc.exists()) {
            // Profile exists - load it
            const data = userDoc.data();
            profile = {
                uid: user.uid,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                lastLogin: new Date()
            } as UserProfile;

            // Update lastLogin in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                lastLogin: serverTimestamp()
            }, { merge: true });
        } else {
            // Profile doesn't exist - create it (for existing Firebase Auth users)
            const username = email.split('@')[0];
            profile = {
                uid: user.uid,
                name: username,
                displayName: username,
                username: username.replace(/[^a-zA-Z0-9]/g, ''),
                email: email,
                avatar: 'trader-1',
                bio: '',
                country: 'US',
                experience: 'Beginner',
                onboardingCompleted: false,
                isGuest: false,
                createdAt: new Date(),
                lastLogin: new Date(),
                theme: 'dark',
                themeColor: '#0ea5e9',
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

            // Save the newly created profile to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                ...profile,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        }

        // Save session
        localStorage.setItem('tradesnap_uid', user.uid);
        localStorage.setItem('tradesnap_email', email);

        return profile;
    } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(mapAuthError(error.code));
    }
};

// Get current user profile
export const getCurrentUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                uid,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            } as UserProfile;
        }
    } catch (e) {
        console.error("Error fetching profile:", e);
    }
    return null;
};

// Sign out
export const handleSignOut = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('tradesnap_uid');
        localStorage.removeItem('tradesnap_email');
        localStorage.removeItem('tradesnap_user_profile');
        localStorage.removeItem('tradesnap_guest');
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Check session on load
export const checkSession = async (): Promise<UserProfile | null> => {
    const uid = localStorage.getItem('tradesnap_uid');
    if (uid) {
        return await getCurrentUserProfile(uid);
    }
    return null;
};

// Helper to map Firebase error codes to user-friendly messages
const mapAuthError = (code: string): string => {
    switch (code) {
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many failed login attempts. Please try again later.';
        default:
            return 'Authentication failed. Please try again.';
    }
};
