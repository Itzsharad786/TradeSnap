// Re-export Firebase services from the main config file
export { auth, db, default as app } from "../firebase.config";

// Initialize additional services
import app from "../firebase.config";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

export const storage = getStorage(app);
export const functions = getFunctions(app);