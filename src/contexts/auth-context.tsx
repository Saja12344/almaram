"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  defaultUserDoc,
  USERS_COLLECTION,
  type UserDocument,
} from "@/lib/firebase/user-doc";

interface AuthContextValue {
  configured: boolean;
  user: User | null;
  userDoc: UserDocument | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserDocument(uid: string, email: string) {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, defaultUserDoc(email));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    let unsubDoc: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      unsubDoc?.();
      setUser(nextUser);

      if (nextUser) {
        void ensureUserDocument(nextUser.uid, nextUser.email || "").catch(console.error);
        const ref = doc(getFirebaseDb(), USERS_COLLECTION, nextUser.uid);
        unsubDoc = onSnapshot(
          ref,
          (snap) => {
            if (snap.exists()) setUserDoc(snap.data() as UserDocument);
          },
          (err) => console.error("Firestore snapshot error:", err)
        );
      } else {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubDoc?.();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await setDoc(doc(getFirebaseDb(), USERS_COLLECTION, cred.user.uid), defaultUserDoc(email));
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const auth = getFirebaseAuth();
      const current = auth.currentUser;
      if (!current?.email) throw new Error("Not signed in");
      const credential = EmailAuthProvider.credential(current.email, currentPassword);
      await reauthenticateWithCredential(current, credential);
      await updatePassword(current, newPassword);
    },
    []
  );

  const refreshUserDoc = useCallback(async () => {
    if (!user) return;
    const snap = await getDoc(doc(getFirebaseDb(), USERS_COLLECTION, user.uid));
    if (snap.exists()) setUserDoc(snap.data() as UserDocument);
  }, [user]);

  const value = useMemo(
    () => ({
      configured,
      user,
      userDoc,
      loading,
      signIn,
      signUp,
      signOut,
      changePassword,
      refreshUserDoc,
    }),
    [configured, user, userDoc, loading, signIn, signUp, signOut, changePassword, refreshUserDoc]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
