import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErr(true);
        console.log("No users found");
        return;
      }

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        setUser(userData);
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    if (!user || !user.uid) {
      console.error("Invalid user object selected:", user);
      return;
    }

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        // Create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
      }

      // Ensure userChats is updated even if chat already exists
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [combinedId + ".userInfo"]: {
          uid: user.uid,
          displayName: user.displayName,
          avatar: user.avatar,
        },
        [combinedId + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "userChats", user.uid), {
        [combinedId + ".userInfo"]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
        },
        [combinedId + ".date"]: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error handling select:", err);
    }

    // console.log('Selected user:', user);
    setUser(null);
    setUsername("");
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      {err && <span>User not found!</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.avatar} alt={user.displayName} />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
