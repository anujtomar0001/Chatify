import React, { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { LuLogOut } from "react-icons/lu";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const fetchAvatar = async () => {
      if (currentUser?.uid) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setAvatar(userDoc.data().avatar);
        }
      }
    };

    fetchAvatar();
  }, [currentUser]);

  // Listen for logout event from localStorage and handle it without reloading
  useEffect(() => {
    const handleLogoutEvent = (e) => {
      if (e.key === "logout") {
        // console.log("Logout event detected in another tab");
      }
    };

    window.addEventListener("storage", handleLogoutEvent);
    return () => window.removeEventListener("storage", handleLogoutEvent);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.setItem("logout", Date.now());
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <div className="navbar">
      <span className="logo">Chatify</span>
      <div className="user">
        <img src={avatar || "/default-avatar.png"} alt="Avatar" />
        <span>{currentUser?.displayName}</span>
        <button onClick={handleLogout}>
          <LuLogOut />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
