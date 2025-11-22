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
    arrayUnion
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

    // Handle dates
    if (!finalData.createdAt) {
        finalData.createdAt = serverTimestamp();
    }

    await setDoc(docRef, finalData, { merge: true });
};

// --- Group Functions ---

export const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const collectionRef = collection(db, "groups");

        const safeData = {
            name: groupData.name || "Unnamed Group",
            description: groupData.description || "",
            avatar: groupData.avatar || "globe",
            type: groupData.type || "Public",
            isPrivate: groupData.isPrivate ?? false,
            password: groupData.password || null,
            topic: groupData.topic || "General",
            createdBy: groupData.createdBy, // Should be passed from auth
            members: groupData.members || [],
            inviteCode: groupData.inviteCode || null,
            bannerUrl: groupData.bannerUrl || null
        };

        const sanitizedGroupData = Object.entries(safeData).reduce((acc, [key, value]) => {
            acc[key] = value === undefined ? null : value;
            return acc;
        }, {} as Record<string, any>);

        const docRef = await addDoc(collectionRef, {
            ...sanitizedGroupData,
            createdAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error: any) {
        console.error("Error creating group:", error);
        throw error;
    }
};

export const getGroupsForUser = (userId: string, callback: (groups: Group[]) => void): Unsubscribe => {
    // Query groups where the user is a member
    const q = query(collection(db, "groups"), where("members", "array-contains", userId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const groups: Group[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            groups.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            } as Group);
        });
        callback(groups);
    }, (error) => {
        console.error("Error in getGroupsForUser:", error);
    });
};

export const getAllGroups = (callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const groups: Group[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            groups.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            } as Group);
        });
        callback(groups);
    }, (error) => {
        console.error("Error in getAllGroups:", error);
    });
};

export const getGroupMessages = (groupId: string, callback: (messages: GroupChatMessage[]) => void): Unsubscribe => {
    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));
    return onSnapshot(q, (querySnapshot) => {
        const messages: GroupChatMessage[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
            } as GroupChatMessage);
        });
        callback(messages);
    });
};

export const sendMessageToGroup = async (groupId: string, messageData: Omit<GroupChatMessage, 'id' | 'timestamp' | 'reactions'>) => {
    const messagesRef = collection(db, "groups", groupId, "messages");
    const sanitizedMessageData = sanitizeData(messageData);

    await addDoc(messagesRef, {
        ...sanitizedMessageData,
        timestamp: serverTimestamp(),
        reactions: {}
    });
};

export const joinGroupByInviteCode = async (inviteCode: string, userId: string): Promise<string | null> => {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("inviteCode", "==", inviteCode), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;

    await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(userId)
    });

    return groupId;
};
