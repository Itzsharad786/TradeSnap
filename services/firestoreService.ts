import {
    collection,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    addDoc,
    serverTimestamp,
    where,
    query,
    orderBy,
    Unsubscribe,
    limit,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    deleteDoc
} from "firebase/firestore";
import { db } from './firebase';
import type { UserProfile, Group, GroupChatMessage } from '../types';

// Helper to remove undefined fields
const sanitizeData = (data: any) => {
    if (!data || typeof data !== 'object') return data;
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
    }, {} as Record<string, any>);
};

// --- User Profile Functions ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                uid,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            } as UserProfile;
        }
    } catch (e) {
        console.error("Error getting user profile:", e);
    }
    return null;
};

export const createOrUpdateUserProfile = async (profileData: UserProfile): Promise<void> => {
    const { uid, ...dataToSet } = profileData;
    const docRef = doc(db, "users", uid);
    const sanitizedData = sanitizeData(dataToSet);
    const finalData = { ...sanitizedData };
    if (!finalData.createdAt) finalData.createdAt = serverTimestamp();
    await setDoc(docRef, finalData, { merge: true });
};

// --- Group Functions ---

// Simple client-side hash for password (in a real app, use a server function)
const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const createGroup = async (groupData: {
    name: string;
    description: string;
    ownerUid: string;
    ownerEmail: string;
    isPrivate: boolean;
    password?: string;
    avatarUrl?: string;
}): Promise<string> => {
    try {
        const collectionRef = collection(db, "groups");

        let passwordHash = null;
        if (groupData.isPrivate && groupData.password) {
            passwordHash = await hashPassword(groupData.password);
        }

        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const initialMember = {
            uid: groupData.ownerUid,
            email: groupData.ownerEmail,
            joinedAt: new Date().toISOString(), // Store as string for easier UI handling, or use serverTimestamp if preferred for sorting
            role: 'owner'
        };

        const safeData = {
            name: groupData.name || "Unnamed Group",
            description: groupData.description || "",
            avatarUrl: groupData.avatarUrl || null,
            isPrivate: groupData.isPrivate ?? false,
            password: passwordHash, // Store hash
            ownerUid: groupData.ownerUid,
            ownerEmail: groupData.ownerEmail,
            members: [initialMember],
            membersUidList: [groupData.ownerUid], // For efficient querying and security rules
            inviteCode: inviteCode,
            createdAt: serverTimestamp(),
        };

        const sanitized = sanitizeData(safeData);
        const docRef = await addDoc(collectionRef, sanitized);
        return docRef.id;
    } catch (error) {
        console.error("Error creating group:", error);
        throw error;
    }
};

export const updateGroup = async (groupId: string, data: any) => {
    const docRef = doc(db, "groups", groupId);
    await updateDoc(docRef, sanitizeData(data));
};

export const deleteGroup = async (groupId: string) => {
    await deleteDoc(doc(db, "groups", groupId));
};

export const joinGroup = async (groupId: string, user: { uid: string, email: string }, password?: string): Promise<boolean> => {
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Group not found");

    const groupData = docSnap.data();

    if (groupData.isPrivate) {
        if (!password) throw new Error("Password required");
        const inputHash = await hashPassword(password);
        if (inputHash !== groupData.password) {
            throw new Error("Incorrect password");
        }
    }

    // Check if already member
    if (groupData.membersUidList?.includes(user.uid)) {
        return true; // Already joined
    }

    const memberData = {
        uid: user.uid,
        email: user.email,
        joinedAt: new Date().toISOString(),
        role: 'member'
    };

    await updateDoc(docRef, {
        members: arrayUnion(memberData),
        membersUidList: arrayUnion(user.uid)
    });

    return true;
};

export const leaveGroup = async (groupId: string, user: { uid: string, email: string }) => {
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const groupData = docSnap.data();
    const memberToRemove = groupData.members.find((m: any) => m.uid === user.uid);

    if (memberToRemove) {
        await updateDoc(docRef, {
            members: arrayRemove(memberToRemove),
            membersUidList: arrayRemove(user.uid)
        });
    }
};

// Fetch Public Groups (isPrivate == false)
export const getPublicGroups = (callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("isPrivate", "==", false), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        callback(groups);
    });
};

// Fetch Groups Owned by User
export const getGroupsForOwner = (ownerUid: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("ownerUid", "==", ownerUid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        callback(groups);
    });
};

// Fetch Groups User is a Member of (including owned)
export const getGroupsForUser = (userUid: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("membersUidList", "array-contains", userUid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        callback(groups);
    });
};

// Helper alias for backward compatibility if needed, or just use getGroupsForUser
export const getUserJoinedGroups = getGroupsForUser;

// Messages
export const getGroupMessages = (groupId: string, callback: (messages: GroupChatMessage[]) => void): Unsubscribe => {
    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toMillis ? doc.data().timestamp.toMillis() : Date.now()
        } as GroupChatMessage));
        callback(messages);
    });
};

export const sendMessageToGroup = async (groupId: string, message: any) => {
    const messagesRef = collection(db, "groups", groupId, "messages");
    await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp()
    });
};

export const joinGroupByInviteCode = async (inviteCode: string, user: { uid: string, email: string }): Promise<string | null> => {
    const q = query(collection(db, "groups"), where("inviteCode", "==", inviteCode), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const groupDoc = snapshot.docs[0];
    const groupId = groupDoc.id;
    const groupData = groupDoc.data();

    // If private, we can't bypass password unless invite code implies bypass? 
    // Usually invite code implies bypass. Let's assume invite code allows join without password.
    // But if the user specifically wants password for private groups even with invite code, we'd need to check.
    // For now, let's allow join.

    // Check if already member
    if (groupData.membersUidList?.includes(user.uid)) return groupId;

    const memberData = {
        uid: user.uid,
        email: user.email,
        joinedAt: new Date().toISOString(),
        role: 'member'
    };

    await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(memberData),
        membersUidList: arrayUnion(user.uid)
    });

    return groupId;
};
