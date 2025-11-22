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
            createdBy: groupData.createdBy,
            ownerUid: groupData.ownerUid, // Required for ownership
            ownerEmail: groupData.ownerEmail, // Required for ownership
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

// Fetch Public Groups + Private Groups owned by user
// Note: Firestore doesn't support OR queries across different fields easily in one go for this specific case with rules.
// We will fetch ALL Public groups, and separately fetch Private groups owned by user, then merge.
// Actually, for simplicity and to match the Rule "allow read: if !resource.data.isPrivate || request.auth.uid == resource.data.ownerUid;",
// we can try to fetch all and let Firestore/Client handle it, but Firestore Rules will block the query if it tries to read forbidden docs.
// So we MUST split the query or use a specific filter that matches the rule.
// Since we can't do "isPrivate == false OR ownerUid == me" in one query easily without composite indexes and potential issues,
// we will implement a two-step subscription helper in the component or just fetch Public groups for now, 
// and let the user see their own private groups via a separate query if needed.
// HOWEVER, the user asked for "Logged-in user sees: All public groups + Only their own private groups".
// We will implement a custom function that sets up two listeners.
// But for this file, we'll keep `getAllPublicGroups` and `getUserPrivateGroups`.

export const getPublicGroups = (callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("isPrivate", "==", false), orderBy("createdAt", "desc"));
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
        console.error("Error in getPublicGroups:", error);
    });
};

export const getUserPrivateGroups = (userId: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("isPrivate", "==", true), where("ownerUid", "==", userId), orderBy("createdAt", "desc"));
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
        console.error("Error in getUserPrivateGroups:", error);
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
    // This might fail if the group is private and not owned by user, due to Rules.
    // But if they have the invite code, they should be able to join?
    // The Rule says: allow read: if !resource.data.isPrivate || request.auth.uid == resource.data.ownerUid;
    // If it's private and I'm not owner, I CANNOT read it to find the invite code.
    // This implies Private groups cannot be joined via invite code unless the rule is relaxed or we use a Cloud Function.
    // Given the strict rules requested, this feature will only work for Public groups or if the user is the owner (which makes no sense to join).
    // We will leave it as is, but note the limitation.

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
