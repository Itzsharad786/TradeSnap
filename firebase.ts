// Re-export Firebase services from the config file
export { auth, db, default as app } from './firebase.config';

// Initialize storage
import app from './firebase.config';
import { getStorage } from 'firebase/storage';

export const storage = getStorage(app);


