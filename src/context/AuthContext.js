import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);

        const unsub = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setCurrentUser({
                ...user,
                avatar: userDoc.data().avatar,
              });
            } else {
              setCurrentUser(user);
            }
          } else {
            setCurrentUser(null);
          }
          setAuthInitialized(true);
        });

        return () => {
          unsub();
        };
      } catch (err) {
        console.error("Error initializing auth:", err);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  if (!authInitialized) return <div>Loading authentication...</div>;

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
