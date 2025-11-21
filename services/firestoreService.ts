
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

// Helper to remove undefined fields (Firestore crashes on undefined)
const sanitizeData = (data: any) => {
    if (!data || typeof data !== 'object') return data;

    return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);
};

// --- User Profile Functions ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            uid,
            ...data,
            // Convert Firestore Timestamps to JS Dates
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as UserProfile;
    }
    return null;
};

export const createOrUpdateUserProfile = async (profileData: UserProfile): Promise<void> => {
    const { uid, ...dataToSet } = profileData;
    const docRef = doc(db, "users", uid);

    // FIX: Sanitize data to remove undefined values before writing to Firestore
    const sanitizedData = sanitizeData(dataToSet);

    // Ensure createdAt is a Firestore Timestamp if it's new or being set
    // If we are updating, we might not want to overwrite createdAt unless necessary
    const finalData = {
        ...sanitizedData,
    };

    // If createdAt is a Date object (from local state), let's keep it or use serverTimestamp for new docs
    if (finalData.createdAt instanceof Date) {
        // For new docs, serverTimestamp is better, but for now we trust the passed object
        // converting to firestore timestamp happens automatically by SDK if it's a Date
    } else if (!finalData.createdAt) {
        finalData.createdAt = serverTimestamp();
    }

    await setDoc(docRef, finalData, { merge: true });
};


// --- Group Functions ---

export const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const collectionRef = collection(db, "groups");

        // Ensure required fields are present and not undefined
        const safeData = {
            name: groupData.name || "Unnamed Group",
            description: groupData.description || "",
            avatar: groupData.avatar || "globe",
            type: groupData.type || "Public",
            isPrivate: groupData.isPrivate ?? false,
            password: groupData.password || null,
            topic: groupData.topic || "General",
            createdBy: groupData.createdBy || "guest",
            members: groupData.members || [],
            inviteCode: groupData.inviteCode || null,
            bannerUrl: groupData.bannerUrl || null
        };

        // FIX: Sanitize group data (replace undefined with null)
        const sanitizedGroupData = Object.entries(safeData).reduce((acc, [key, value]) => {
            acc[key] = value === undefined ? null : value;
            return acc;
        }, {} as Record<string, any>);

        console.log("Creating group with data:", sanitizedGroupData);

        const docRef = await addDoc(collectionRef, {
            ...sanitizedGroupData,
            createdAt: serverTimestamp(),
        });

        console.log("Group created successfully with ID:", docRef.id);
        return docRef.id;
    } catch (error: any) {
        console.error("Detailed Firestore Error in createGroup:", error);
        if (error.code === 'permission-denied') {
            console.error("PERMISSION DENIED: Check Firestore Rules. You might need: allow create: if true;");
        }
        throw error;
    }
};

export const getGroupsForUser = (userId: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("members", "array-contains", userId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const groups: Group[] = [];
        querySnapshot.forEach((doc) => {
            groups.push({ id: doc.id, ...doc.data() } as Group);
        });
        callback(groups);
    }, (error) => {
        console.error("Firestore Error in getGroupsForUser:", error);
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
            console.error("MISSING INDEX! Create it here:", error.message);
        }
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
                // Convert Firestore Timestamps to numbers
                timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
            } as GroupChatMessage);
        });
        callback(messages);
    });
};

export const sendMessageToGroup = async (groupId: string, messageData: Omit<GroupChatMessage, 'id' | 'timestamp' | 'reactions'>) => {
    const messagesRef = collection(db, "groups", groupId, "messages");
    // FIX: Sanitize message data
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

    if (querySnapshot.empty) {
        return null;
    }

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;

    await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(userId)
    });

    return groupId;
};
