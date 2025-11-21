// Re-export Firebase services from the main config file
// This file exists to provide a consistent import path for services
export { auth, db, default as app } from '../firebase.config';

// Initialize storage separately since it's not in firebase.config.ts
import app from '../firebase.config';
import { getStorage } from 'firebase/storage';

export const storage = getStorage(app);


