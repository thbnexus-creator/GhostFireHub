import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = !getApps().length ? initializeApp({
  projectId: firebaseConfig.projectId,
}) : getApps()[0];

export const adminDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const adminDbDefault = getFirestore(app);
export const adminAuth = getAuth(app);
