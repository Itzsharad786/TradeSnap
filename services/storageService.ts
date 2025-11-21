
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase/index';

export const uploadProfileAvatar = async (file: File, uid: string): Promise<string> => {
    if (!uid) throw new Error("User ID required for upload.");
    
    const filePath = `avatars/${uid}/${file.name}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
};
