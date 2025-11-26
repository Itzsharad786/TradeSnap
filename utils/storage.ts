import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../services/firebase';

// Storage helper for uploading group images
export const uploadGroupImage = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
