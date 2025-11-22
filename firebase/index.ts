import { auth, db, default as app } from "../firebase.config";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

export const storage = getStorage(app);
export const functions = getFunctions(app);

export { auth, db, app };