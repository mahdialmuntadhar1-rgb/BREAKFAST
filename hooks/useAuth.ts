import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (role?: 'user' | 'owner') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role?: 'user' | 'owner') => Promise<void>;
  signOut: () => Promise<void>;
}

const ROLE_STORAGE_KEY = 'pending_role';

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role?: 'user' | 'owner') => {
    if (role) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, role);
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, role: 'user' | 'owner' = 'user') => {
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    const fallbackName = email.split('@')[0] || 'User';
    await updateProfile(credential.user, { displayName: fallbackName });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
