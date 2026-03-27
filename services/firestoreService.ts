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
    deleteDoc,
    increment,
    runTransaction,
    deleteField
} from "firebase/firestore";
import { db } from './firebase';
import type { UserProfile, Group, GroupChatMessage, GroupMember } from '../types';

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

export const listenToUserProfile = (uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe => {
    const docRef = doc(db, "users", uid);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback({
                uid,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            } as UserProfile);
        } else {
            callback(null);
        }
    });
};

export const createOrUpdateUserProfile = async (profileData: UserProfile): Promise<void> => {
    const { uid, ...dataToSet } = profileData;
    const docRef = doc(db, "users", uid);
    const sanitizedData = sanitizeData(dataToSet);
    const finalData = { ...sanitizedData };
    if (!finalData.createdAt) finalData.createdAt = serverTimestamp();
    await setDoc(docRef, finalData, { merge: true });
};

export const updateUserLastLogin = async (uid: string): Promise<void> => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
};

// --- Group Functions ---

// Simple client-side hash for password (in a real app, use a server function)
const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const inputHash = await hashPassword(password);
    return inputHash === hash;
};

const normalizeGroupType = (type: unknown, isPrivate?: boolean): 'public' | 'private' => {
    if (typeof type === 'string') {
        const normalized = type.toLowerCase();
        if (normalized === 'public' || normalized === 'private') {
            return normalized;
        }
    }
    return isPrivate ? 'private' : 'public';
};

const isPublicGroup = (group: any): boolean => normalizeGroupType(group?.type, group?.isPrivate) === 'public';
const isPrivateGroup = (group: any): boolean => normalizeGroupType(group?.type, group?.isPrivate) === 'private';

const getCreatedAtMillis = (value: any): number => {
    if (!value) return 0;
    if (typeof value?.toMillis === 'function') return value.toMillis();
    if (typeof value?.seconds === 'number') return value.seconds * 1000;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
};

export const createGroup = async (groupData: {
    name: string;
    description: string;
    ownerUid: string;
    ownerEmail: string;
    isPrivate: boolean;
    type: 'public' | 'private';
    password?: string;
    avatarUrl?: string;
}): Promise<string> => {
    try {
        const collectionRef = collection(db, "groups");
        const normalizedType = normalizeGroupType(groupData.type, groupData.isPrivate);

        // Check Limits
        const q = query(collectionRef, where("ownerUid", "==", groupData.ownerUid));
        const snapshot = await getDocs(q);
        const userGroups = snapshot.docs.map(doc => doc.data());

        const publicCount = userGroups.filter(isPublicGroup).length;
        const privateCount = userGroups.filter(isPrivateGroup).length;

        if (normalizedType === 'public' && publicCount >= 2) {
            throw new Error("You have reached the limit of 2 Public Groups.");
        }
        if (normalizedType === 'private' && privateCount >= 3) {
            throw new Error("You have reached the limit of 3 Private Groups.");
        }

        let passwordHash = null;
        if (normalizedType === 'private' && groupData.password) {
            passwordHash = await hashPassword(groupData.password);
        }

        const inviteCode = generateInviteCode();

        const initialMember = {
            uid: groupData.ownerUid,
            email: groupData.ownerEmail,
            joinedAt: new Date().toISOString(),
            role: 'owner',
            isOnline: true
        };

        const safeData = {
            name: groupData.name || "Unnamed Group",
            description: groupData.description || "",
            avatarUrl: groupData.avatarUrl || null,
            isPrivate: normalizedType === 'private',
            type: normalizedType,
            password: passwordHash, // Storing hash in password field for now
            passwordHash: passwordHash,
            ownerUid: groupData.ownerUid,
            ownerEmail: groupData.ownerEmail,
            members: [initialMember],
            membersUidList: [groupData.ownerUid],
            inviteCode: inviteCode,
            createdAt: serverTimestamp(),
        };

        const sanitized = sanitizeData(safeData);
        const docRef = await addDoc(collectionRef, sanitized);

        // Update user's group count and groupMembers collection
        const userRef = doc(db, "users", groupData.ownerUid);
        const countField = normalizedType === 'public' ? 'publicGroupsCount' : 'privateGroupsCount';
        const currentCount = (normalizedType === 'public' ? publicCount : privateCount);

        await Promise.all([
            updateDoc(userRef, { [countField]: currentCount + 1 }),
            setDoc(doc(db, "groupMembers", groupData.ownerUid), {
                groups: arrayUnion(docRef.id)
            }, { merge: true })
        ]);

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
    // Get group data first to know the type and owner
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const groupType = normalizeGroupType(groupData.type, groupData.isPrivate);
        const ownerUid = groupData.ownerUid;

        // Delete the group
        await deleteDoc(groupRef);

        // Decrement user's group count and remove from groupMembers
        if (ownerUid) {
            const userRef = doc(db, "users", ownerUid);
            const countField = groupType === 'public' ? 'publicGroupsCount' : 'privateGroupsCount';
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const currentCount = userSnap.data()[countField] || 0;
                if (currentCount > 0) {
                    await updateDoc(userRef, {
                        [countField]: currentCount - 1
                    });
                }
            }
        }
    }
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

    if (groupData.membersUidList?.includes(user.uid)) {
        return true;
    }

    const memberData = {
        uid: user.uid,
        email: user.email,
        joinedAt: new Date().toISOString(),
        role: 'member',
        isOnline: true
    };

    await Promise.all([
        updateDoc(docRef, {
            members: arrayUnion(memberData),
            membersUidList: arrayUnion(user.uid)
        }),
        setDoc(doc(db, "groupMembers", user.uid), {
            groups: arrayUnion(groupId)
        }, { merge: true })
    ]);

    return true;
};

export const leaveGroup = async (groupId: string, user: { uid: string, email: string }) => {
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const groupData = docSnap.data();
    const memberToRemove = groupData.members.find((m: any) => m.uid === user.uid);

    if (memberToRemove) {
        await Promise.all([
            updateDoc(docRef, {
                members: arrayRemove(memberToRemove),
                membersUidList: arrayRemove(user.uid)
            }),
            setDoc(doc(db, "groupMembers", user.uid), {
                groups: arrayRemove(groupId)
            }, { merge: true })
        ]);
    }
};

// Fetch Public Groups (type == "public")
export const getPublicGroups = (callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("type", "in", ["public", "Public"]));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Group))
            .sort((a, b) => getCreatedAtMillis((b as any).createdAt) - getCreatedAtMillis((a as any).createdAt));
        callback(groups);
    }, (error) => {
        console.error("Error loading public groups:", error);
        callback([]);
    });
};

// Fetch Groups Owned by User
export const getGroupsForOwner = (ownerUid: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("ownerUid", "==", ownerUid));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Group))
            .sort((a, b) => getCreatedAtMillis((b as any).createdAt) - getCreatedAtMillis((a as any).createdAt));
        callback(groups);
    }, (error) => {
        console.error("Error loading owner groups:", error);
        callback([]);
    });
};

// Fetch Groups User is a Member of (including owned)
export const getGroupsForUser = (userUid: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(collection(db, "groups"), where("membersUidList", "array-contains", userUid));
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Group))
            .sort((a, b) => getCreatedAtMillis((b as any).createdAt) - getCreatedAtMillis((a as any).createdAt));
        callback(groups);
    }, (error) => {
        console.error("Error loading user groups:", error);
        callback([]);
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
            timestamp: doc.data().timestamp?.toMillis ? doc.data().timestamp.toMillis() : Date.now(),
            seenBy: doc.data().seenBy || []
        } as GroupChatMessage));
        callback(messages);
    });
};

export const listenToGroup = (groupId: string, callback: (group: Group | null) => void): Unsubscribe => {
    const groupRef = doc(db, "groups", groupId);
    return onSnapshot(groupRef, (snap) => {
        if (!snap.exists()) {
            callback(null);
            return;
        }
        callback({ id: snap.id, ...(snap.data() as any) } as Group);
    }, (error) => {
        console.error("Error listening group metadata:", error);
        callback(null);
    });
};

export const sendMessageToGroup = async (groupId: string, message: any) => {
    const messagesRef = collection(db, "groups", groupId, "messages");
    await addDoc(messagesRef, {
        ...message,
        seenBy: message.authorId ? [message.authorId] : [],
        timestamp: serverTimestamp()
    });

    // Update last message on group doc
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
        lastMessage: {
            text: message.type === 'image' ? 'Sent an image' : message.text,
            timestamp: serverTimestamp(),
            authorName: message.authorName
        }
    });
};

export const markGroupMessageSeen = async (groupId: string, messageId: string, uid: string): Promise<void> => {
    try {
        const messageRef = doc(db, "groups", groupId, "messages", messageId);
        await updateDoc(messageRef, {
            seenBy: arrayUnion(uid)
        });
    } catch (error) {
        // Keep silent in UI; this is non-blocking metadata
        console.warn("Could not mark message as seen:", error);
    }
};

export const setGroupTypingStatus = async (groupId: string, uid: string, isTyping: boolean): Promise<void> => {
    try {
        const groupRef = doc(db, "groups", groupId);
        const field = `typingStatus.${uid}`;
        await updateDoc(groupRef, {
            [field]: isTyping ? serverTimestamp() : deleteField()
        });
    } catch (error) {
        console.warn("Could not update typing status:", error);
    }
};

export const setGroupPresenceStatus = async (
    groupId: string,
    uid: string,
    status: 'focusing' | 'active' = 'active'
): Promise<void> => {
    try {
        const groupRef = doc(db, "groups", groupId);
        const field = `presenceStatus.${uid}`;
        await updateDoc(groupRef, {
            [field]: {
                status,
                lastActive: serverTimestamp()
            }
        });
    } catch (error) {
        console.warn("Could not update presence status:", error);
    }
};

export const deleteMessage = async (groupId: string, messageId: string) => {
    const messageRef = doc(db, "groups", groupId, "messages", messageId);
    await deleteDoc(messageRef);
};

export const pinMessage = async (groupId: string, messageId: string, isPinned: boolean) => {
    const messageRef = doc(db, "groups", groupId, "messages", messageId);
    await updateDoc(messageRef, { isPinned });
};

export const joinGroupByInviteCode = async (inviteCode: string, user: { uid: string, email: string }): Promise<string | null> => {
    const q = query(collection(db, "groups"), where("inviteCode", "==", inviteCode), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const groupDoc = snapshot.docs[0];
    const groupId = groupDoc.id;
    const groupData = groupDoc.data();

    if (groupData.membersUidList?.includes(user.uid)) return groupId;

    const memberData = {
        uid: user.uid,
        email: user.email,
        joinedAt: new Date().toISOString(),
        role: 'member',
        isOnline: true
    };

    await Promise.all([
        updateDoc(doc(db, "groups", groupId), {
            members: arrayUnion(memberData),
            membersUidList: arrayUnion(user.uid)
        }),
        setDoc(doc(db, "groupMembers", user.uid), {
            groups: arrayUnion(groupId)
        }, { merge: true })
    ]);

    return groupId;
};

// Helper function to generate invite code
export const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TRD-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get user's group counts
export const getUserGroupCounts = async (userId: string): Promise<{ publicCount: number, privateCount: number }> => {
    try {
        const q = query(collection(db, "groups"), where("ownerUid", "==", userId));
        const snapshot = await getDocs(q);
        const userGroups = snapshot.docs.map(doc => doc.data());

        const publicCount = userGroups.filter(isPublicGroup).length;
        const privateCount = userGroups.filter(isPrivateGroup).length;

        return { publicCount, privateCount };
    } catch (error) {
        console.error("Error getting user group counts:", error);
        return { publicCount: 0, privateCount: 0 };
    }
};

// Join group by invite code with password verification
export const joinGroupByInviteCodeAndPassword = async (
    inviteCode: string,
    password: string,
    user: { uid: string, email: string, username?: string, avatar?: string }
): Promise<{ success: boolean, groupId?: string, error?: string }> => {
    try {
        // Find group by invite code
        const q = query(collection(db, "groups"), where("inviteCode", "==", inviteCode), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: "Invalid invite code" };
        }

        const groupDoc = snapshot.docs[0];
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;

        // Check if already a member
        if (groupData.membersUidList?.includes(user.uid)) {
            return { success: true, groupId, error: "Already a member" };
        }

        // Verify password for private groups
        if (groupData.isPrivate && groupData.password) {
            const isValid = await verifyPassword(password, groupData.password);
            if (!isValid) {
                return { success: false, error: "Incorrect password" };
            }
        }

        // Add user to group
        const memberData = {
            uid: user.uid,
            email: user.email,
            username: user.username || user.email?.split('@')[0] || 'User',
            avatar: user.avatar || 'default',
            joinedAt: new Date().toISOString(),
            isOnline: true,
            lastSeen: serverTimestamp()
        };

        await Promise.all([
            updateDoc(doc(db, "groups", groupId), {
                members: arrayUnion(memberData),
                membersUidList: arrayUnion(user.uid)
            }),
            setDoc(doc(db, "groupMembers", user.uid), {
                groups: arrayUnion(groupId)
            }, { merge: true })
        ]);

        return { success: true, groupId };
    } catch (error) {
        console.error("Error joining group:", error);
        return { success: false, error: "Failed to join group" };
    }
};

// Update group banner
export const updateGroupBanner = async (groupId: string, bannerUrl: string): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { bannerUrl });
};

// Update group avatar
export const updateGroupAvatar = async (groupId: string, avatarUrl: string): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { avatarUrl });
};

// Get member details with online status
export const getGroupMembersWithDetails = async (groupId: string): Promise<GroupMember[]> => {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) return [];

    const groupData = groupSnap.data();
    return groupData.members || [];
};

// Update user Instagram handle
export const updateUserInstagram = async (uid: string, instagramHandle: string): Promise<void> => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { instagramHandle });
};

// Get last group creation date for user
export const getLastGroupCreationDate = async (userId: string): Promise<Date | null> => {
    try {
        const q = query(
            collection(db, "groups"),
            where("ownerUid", "==", userId),
            orderBy("createdAt", "desc"),
            limit(1)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const lastGroup = snapshot.docs[0].data();
        return lastGroup.createdAt?.toDate ? lastGroup.createdAt.toDate() : null;
    } catch (error) {
        console.error("Error getting last group creation date:", error);
        return null;
    }
};

// Follow User
export const followUser = async (currentUid: string, targetUid: string) => {
    const currentUserRef = doc(db, "users", currentUid);
    const targetUserRef = doc(db, "users", targetUid);

    await runTransaction(db, async (transaction) => {
        // Add to following subcollection
        const followingRef = doc(db, "users", currentUid, "following", targetUid);
        transaction.set(followingRef, { since: serverTimestamp() });

        // Add to followers subcollection
        const followersRef = doc(db, "users", targetUid, "followers", currentUid);
        transaction.set(followersRef, { since: serverTimestamp() });

        // Update counts
        transaction.update(currentUserRef, { followingCount: increment(1) });
        transaction.update(targetUserRef, { followersCount: increment(1) });
    });
};

export const unfollowUser = async (currentUid: string, targetUid: string) => {
    const currentUserRef = doc(db, "users", currentUid);
    const targetUserRef = doc(db, "users", targetUid);

    await runTransaction(db, async (transaction) => {
        // Remove from following subcollection
        const followingRef = doc(db, "users", currentUid, "following", targetUid);
        transaction.delete(followingRef);

        // Remove from followers subcollection
        const followersRef = doc(db, "users", targetUid, "followers", currentUid);
        transaction.delete(followersRef);

        // Update counts
        transaction.update(currentUserRef, { followingCount: increment(-1) });
        transaction.update(targetUserRef, { followersCount: increment(-1) });
    });
};

export const isFollowing = async (currentUid: string, targetUid: string): Promise<boolean> => {
    const docRef = doc(db, "users", currentUid, "following", targetUid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
};

// Alias for isFollowing (for compatibility)
export const checkIfFollowing = isFollowing;

// Get all groups visible to a user (public + groups they're a member of)
export const getAllGroups = async (userUid: string): Promise<Group[]> => {
    try {
        // Get all public groups
        const publicQuery = query(
            collection(db, "groups"),
            where("type", "==", "public"),
            orderBy("createdAt", "desc")
        );
        const publicSnapshot = await getDocs(publicQuery);
        const publicGroups = publicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));

        // Get groups user is a member of (including private ones)
        const memberQuery = query(
            collection(db, "groups"),
            where("membersUidList", "array-contains", userUid),
            orderBy("createdAt", "desc")
        );
        const memberSnapshot = await getDocs(memberQuery);
        const memberGroups = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));

        // Combine and deduplicate
        const allGroupsMap = new Map<string, Group>();
        [...publicGroups, ...memberGroups].forEach(group => {
            allGroupsMap.set(group.id, group);
        });

        return Array.from(allGroupsMap.values());
    } catch (error) {
        console.error("Error getting all groups:", error);
        return [];
    }
};

// Get a single group by ID
export const getGroupById = async (groupId: string): Promise<Group | null> => {
    try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) return null;

        return { id: groupSnap.id, ...groupSnap.data() } as Group;
    } catch (error) {
        console.error("Error getting group by ID:", error);
        return null;
    }
};
