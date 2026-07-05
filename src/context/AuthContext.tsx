import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 'cmo' | 'mo' | 'pharmacist' | 'frontdesk' | 'staff';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  register: (email: string, password: string, role: UserRole) => Promise<User>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  canEditStock: boolean;
  canManageBeds: boolean;
  canManageDoctors: boolean;
  canRegisterPatients: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role as UserRole);
          } else {
            setRole('staff'); // fallback
          }
        } catch (e) {
          console.error("Error fetching user role: ", e);
          setRole('staff');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        role,
        createdAt: new Date()
      });
      
      await signOut(auth)
      setUser(newUser);
      setRole(role);
      setLoading(false);
      return newUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // const login = async (email: string, password: string) => {
  //   setLoading(true);
  //   try {
  //     const cred = await signInWithEmailAndPassword(auth, email, password);
  //     setLoading(false);
  //     return cred.user;
  //   } catch (error) {
  //     setLoading(false);
  //     throw error;
  //   }
  // };

  const login = async (email: string, password: string) => {
    // Don't manage `loading` here. onAuthStateChanged is the single source
    // of truth for auth loading — it also fetches the user's role from
    // Firestore before flipping loading to false. If we also flip loading
    // here, it can go false before the role fetch finishes, so the
    // protected route briefly sees "loading: false, user: null" and
    // bounces back to /login, even though sign-in actually succeeded.
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Permissions mapping:
  const canEditStock = role === 'pharmacist' || role === 'cmo';
  const canManageBeds = role === 'mo' || role === 'cmo';
  const canManageDoctors = role === 'cmo';
  const canRegisterPatients = role === 'frontdesk' || role === 'cmo';
  const isAdmin = role === 'cmo';

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      register,
      login,
      logout,
      resetPassword,
      canEditStock,
      canManageBeds,
      canManageDoctors,
      canRegisterPatients,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
