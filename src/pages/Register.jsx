import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const displayName = e.target[0].value.trim();
    const email = e.target[1].value.trim();
    const password = e.target[2].value.trim();
    const file = e.target[3]?.files[0];

    if (!displayName || !email || !password || !file) {
      setErr(true);
      setLoading(false);
      return;
    }

    let res;
    try {
      // Create user with email and password
      res = await createUserWithEmailAndPassword(auth, email, password);

      // Convert the file to Base64
      const photoBase64 = await convertToBase64(file);

      // Update user profile with displayName
      await updateProfile(res.user, {
        displayName,
      });

      // Save user details in Firestore, including Base64 avatar
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName,
        email,
        avatar: photoBase64,
      });

      // Create an empty userChats document
      await setDoc(doc(db, "userChats", res.user.uid), {});

      // Sign the user out after registration to prevent auto-login
      await signOut(auth);

      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      console.error("Error during sign-up:", err);

      // If there is an error, delete the user from Firebase Authentication
      if (res && res.user) {
        await deleteUser(res.user);
      }
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chatify</span>
        <span className="title">Create an account!</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="display name" />
          <input required type="email" placeholder="email" />
          <input required type="password" placeholder="password" />
          <input
            required
            style={{ opacity: 0, position: "absolute", zIndex: -1 }}
            type="file"
            id="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file">
            <img src={Add} alt="" />
            <span>{fileName ? fileName : "Add an avatar"}</span>
          </label>
          <button disabled={loading}>Sign up</button>
          {loading && "Uploading and compressing the image please wait..."}
          {err && <span>Something went wrong!!</span>}
        </form>
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
