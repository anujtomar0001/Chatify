import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState({});
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        if (doc.exists()) {
          setChats(doc.data());
        }
      });

      return () => unsub();
    };

    getChats();
  }, [currentUser?.uid]);

  const handleSelect = async (user) => {
    if (!user || !user.uid) {
      console.error("Invalid user object selected:", user);
      return;
    }
    dispatch({ type: "CHANGE_USER", payload: user });

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const chatDoc = await getDoc(doc(db, "chats", combinedId));
      if (!chatDoc.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
      }

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
  };

  // console.log('Chats data:', chats);

  return (
    <div className="chatsContainer">
      <div className="chats">
        {Object.entries(chats)
          .sort((a, b) => b[1]?.date - a[1]?.date)
          .map(([chatId, chat]) => (
            <div
              className="userChat"
              key={chatId}
              onClick={async () => {
                if (!chat.userInfo) {
                  console.error("Missing userInfo for chat:", chat);
                  const userId = chatId
                    .split(currentUser.uid)
                    .find((id) => id !== "");
                  const userDoc = await getDoc(doc(db, "users", userId));
                  if (userDoc.exists()) {
                    const userInfo = userDoc.data();
                    handleSelect({
                      uid: userInfo.uid,
                      displayName: userInfo.displayName,
                      avatar: userInfo.avatar,
                    });
                  } else {
                    console.error("User not found in Firestore");
                  }
                  return;
                }
                // console.log('Selected chat:', chat);
                handleSelect(chat.userInfo);
              }}
            >
              <img src={chat.userInfo?.avatar || "default-avatar.png"} alt="" />
              <div className="userChatInfo">
                <span>{chat.userInfo?.displayName || "Unknown User"}</span>
                <p>{chat.lastMessage?.text || "No messages yet"}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Chats;
