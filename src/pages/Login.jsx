import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(false);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email and Password are required.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.message);
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chatify</span>
        <span className="title">Welcome back!</span>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {err && <span>Invalid email or password. Please try again!</span>}
        </form>
        <p>
          You don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
