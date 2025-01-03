import React, { useContext, useState } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleMoreClick = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.setItem("logout", Date.now());
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <div className="chat">
      <div className="chatInfo">
        <span>{data.user?.displayName}</span>
        <div className="chatIcons">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <div className="moreIconContainer">
            <img src={More} alt="" onClick={handleMoreClick} />
            {dropdownVisible && (
              <div className="dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Chat;