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

export const createGroup = async (groupData: any): Promise<string> => {
    try {
        const collectionRef = collection(db, "groups");
        const safeData = {
            name: groupData.name || "Unnamed Group",
            description: groupData.description || "",
            avatarUrl: groupData.avatarUrl || null,
            isPrivate: groupData.isPrivate ?? false,
            password: groupData.password || null,
            ownerUid: groupData.ownerUid,
            ownerEmail: groupData.ownerEmail,
            members: groupData.members || [], // Array of objects { uid, email, joinedAt }
            inviteCode: groupData.inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
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

export const joinGroup = async (groupId: string, user: { uid: string, email: string }) => {
    const docRef = doc(db, "groups", groupId);
    const memberData = {
        uid: user.uid,
        email: user.email,
        joinedAt: new Date().toISOString() // Store as string for easier array handling or timestamp
    };
    // Note: This requires 'members' to be an array of maps. 
    // arrayUnion works with exact object matches.
    await updateDoc(docRef, {
        members: arrayUnion(memberData)
    });
};

export const leaveGroup = async (groupId: string, memberData: any) => {
    const docRef = doc(db, "groups", groupId);
    await updateDoc(docRef, {
        members: arrayRemove(memberData)
    });
};

// Fetch Public Groups
export const getPublicGroups = (callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("isPrivate", "==", false), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        callback(groups);
    });
};

// Fetch My Groups (Owned or Member)
// Firestore array-contains with objects is tricky. 
// We usually store a separate "memberUids" array for querying, but the user schema didn't specify it.
// We will try to filter client side if needed, or assume the user adds a 'memberUids' field for indexing.
// For now, we'll fetch "Owned" groups.
export const getUserOwnedGroups = (userId: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("ownerUid", "==", userId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        callback(groups);
    });
};

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
    // Try to find group by invite code
    // This query fails for private groups if user is not owner (due to rules)
    const q = query(collection(db, "groups"), where("inviteCode", "==", inviteCode), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const groupDoc = snapshot.docs[0];
    const groupId = groupDoc.id;

    await joinGroup(groupId, user);
    return groupId;
};
