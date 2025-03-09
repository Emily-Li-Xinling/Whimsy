import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, collection, doc, getDoc, Firestore, getDocs } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration validation
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  console.log('Full Firebase configuration:', {
    apiKey: config.apiKey ? '✓ (set)' : '✗ (missing)',
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId ? '✓ (set)' : '✗ (missing)',
  });

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    const error = new Error(`Missing Firebase configuration fields: ${missingFields.join(', ')}`);
    console.error('Firebase configuration error:', error);
    throw error;
  }

  return config;
};

// Initialize Firebase with validation
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  console.log('Initializing Firebase...');
  const firebaseConfig = validateConfig();
  
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  db = getFirestore(app);
  console.log('Firestore initialized');
  
  auth = getAuth(app);
  console.log('Auth initialized');
  
  storage = getStorage(app);
  console.log('Storage initialized');

  // Enable offline persistence
  try {
    console.log('Enabling offline persistence...');
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
      } else if (err.code == 'unimplemented') {
        console.warn('The current browser doesn\'t support all of the features required to enable persistence');
      }
    });
  } catch (err) {
    console.warn('Error enabling persistence:', err);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export a function to check Firestore connection
export const checkFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // First, check if we have a valid Firestore instance
    if (!db) {
      const error = new Error('Firestore instance is not initialized');
      console.error('Connection check failed:', error);
      return false;
    }

    // Check if Firebase app is initialized correctly
    if (!app) {
      const error = new Error('Firebase app is not initialized');
      console.error('Connection check failed:', error);
      return false;
    }

    // Log current Firebase app configuration
    const currentConfig = app.options;
    console.log('Current Firebase configuration:', {
      authDomain: currentConfig.authDomain,
      projectId: currentConfig.projectId,
    });

    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore connection timeout')), 10000)
    );

    console.log('Attempting to read test document...');
    
    // Try to read a document from a public test collection
    try {
      const testCollection = collection(db, '_connection_test');
      const testDoc = doc(testCollection, 'test');
      await Promise.race([getDoc(testDoc), timeout]);
      console.log('Firestore connection successful');
      return true;
    } catch (error: any) {
      // If we get a "not-found" error, that means we successfully connected
      // but the document doesn't exist (which is fine)
      if (error.code === 'not-found') {
        console.log('Connection test successful (document not found)');
        return true;
      }
      
      // If we get a permission error, try creating the test collection
      if (error.code === 'permission-denied') {
        console.log('Permission denied for test document, checking database existence...');
        try {
          // Try to list any documents to verify database exists and is accessible
          const snapshot = await Promise.race([
            getDocs(collection(db, '_connection_test')),
            timeout
          ]);
          console.log('Database exists and is accessible');
          return true;
        } catch (listError: any) {
          if (listError.code === 'permission-denied') {
            console.error('Permission denied. Please check Firestore rules and ensure database exists.');
          } else {
            console.error('Error checking database:', listError);
          }
          throw listError;
        }
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Firestore connection error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      config: app?.options || 'App not initialized'
    });
    return false;
  }
};

// Export initialized services
export { app, db, auth, storage }; 