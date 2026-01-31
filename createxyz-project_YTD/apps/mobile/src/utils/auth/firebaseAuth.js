import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export const firebaseAuth = {
  // Sign up with email and password
  signUp: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: displayName || '',
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          name: displayName || user.displayName,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Firebase sign up error:', error);
      return {
        success: false,
        error: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          name: userData.name || user.displayName,
          emailVerified: user.emailVerified,
          ...userData
        }
      };
    } catch (error) {
      console.error('Firebase sign in error:', error);
      return {
        success: false,
        error: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Firebase sign out error:', error);
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          emailVerified: user.emailVerified
        });
      } else {
        callback(null);
      }
    });
  }
};

// Helper function to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'Authentication failed. Please try again';
  }
}
