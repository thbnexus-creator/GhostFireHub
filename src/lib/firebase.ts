import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logOutFromFirebase = async () => {
  await signOut(auth);
};

/**
 * Securely uploads a file to Firebase Storage. 
 * Falls back gracefully to standard Base64 Data URL if the storage bucket is not configured/provisioned or throws a service error.
 */
export const uploadFileToFirebase = async (file: File, folder: string = 'uploads'): Promise<string> => {
  try {
    const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fileRef = ref(storage, `${folder}/${uniqueName}`);
    const uploadTask = await uploadBytesResumable(fileRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return downloadURL;
  } catch (error) {
    console.warn("Firebase Storage upload failed, falling back to Base64:", error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as Data URL"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Deletes a file from Firebase Storage.
 */
export const deleteFileFromFirebase = async (fileUrl: string): Promise<boolean> => {
  if (!fileUrl || !fileUrl.startsWith('http') || !fileUrl.includes('firebasestorage.googleapis.com')) {
    // If it's a base64 data url or other URL, no need to delete from Storage.
    return true;
  }
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error("Failed to delete file from Firebase Storage:", error);
    return false;
  }
};
