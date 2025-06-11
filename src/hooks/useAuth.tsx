
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  browserLocalPersistence
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    const setupAuth = async () => {
      try {
        console.log("Setting up Firebase auth listener");
        const auth = getFirebaseAuth();
        
        try {
          console.log("Setting up Firebase auth persistence");
          await auth.setPersistence(browserLocalPersistence);
          console.log("Firebase auth persistence set successfully");
        } catch (error) {
          console.error("Error setting auth persistence:", error);
        }
        
        console.log("Setting up auth state change listener");
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? `User logged in: ${firebaseUser.uid}` : "No user");
          
          if (firebaseUser) {
            try {
              console.log("Fetching user data for:", firebaseUser.uid);
              const userData = await fetchUserData(firebaseUser.uid);
              console.log("User data fetched successfully:", userData ? "User exists" : "New user");
              
              const userObj = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                points: userData?.points || 0,
                currentStreak: userData?.currentStreak || 0,
                username: userData?.username || '',
                isPublicProfile: userData?.isPublicProfile || false
              };
              
              setUser(userObj);
              setIsLoggedIn(true);
              
              console.log("All user data loaded successfully");
            } catch (error) {
              console.error('Error in auth state listener:', error);
              const userObj = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                points: 0,
                currentStreak: 0,
                username: '',
                isPublicProfile: false
              };
              setUser(userObj);
              setIsLoggedIn(true);
            }
          } else {
            console.log("No user logged in, resetting state");
            setUser(null);
            setIsLoggedIn(false);
          }
        });
        
        console.log("Auth state listener setup complete");
      } catch (error) {
        console.error('Error setting up auth listener:', error);
      }
    };
    
    setupAuth();
    
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const fetchUserData = async (uid: string): Promise<User> => {
    try {
      const db = getFirebaseFirestore();
      const auth = getFirebaseAuth();
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          id: uid,
          email: userDoc.data().email,
          username: userDoc.data().username || '',
          points: userDoc.data().points || 0,
          currentStreak: userDoc.data().currentStreak || 0,
          isPublicProfile: userDoc.data().isPublicProfile || false
        };
      } else {
        const newUser = {
          id: uid,
          email: auth.currentUser?.email || '',
          points: 0,
          currentStreak: 0,
          isPublicProfile: false
        };
        await setDoc(userDocRef, newUser);
        return newUser;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const auth = getFirebaseAuth();
      return {
        id: uid,
        email: auth.currentUser?.email || '',
        points: 0,
        currentStreak: 0,
        isPublicProfile: false
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logging in with:', email);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const db = getFirebaseFirestore();
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        email,
        points: 0,
        currentStreak: 0,
        username: '',
        isPublicProfile: false
      });
      
      const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
      await setDoc(streakDocRef, {
        currentStreak: 0,
        lastCompletedDate: new Date()
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Logging in with Google');
      
      const uid = userCredential.user.uid;
      const email = userCredential.user.email || '';
      
      const db = getFirebaseFirestore();
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email,
          points: 0,
          currentStreak: 0,
          username: '',
          isPublicProfile: false
        });
        
        const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
        await setDoc(streakDocRef, {
          currentStreak: 0,
          lastCompletedDate: new Date()
        });
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateUsername = async (username: string): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      
      await updateDoc(userDocRef, { username });
      setUser(prev => prev ? { ...prev, username } : null);
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  };

  const updateProfileVisibility = async (isPublic: boolean): Promise<void> => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      
      await updateDoc(userDocRef, { isPublicProfile: isPublic });
      setUser(prev => prev ? { ...prev, isPublicProfile: isPublic } : null);
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      throw error;
    }
  };

  return {
    user,
    isLoggedIn,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUsername,
    updateProfileVisibility
  };
};
