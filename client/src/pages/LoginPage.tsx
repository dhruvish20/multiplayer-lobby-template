import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      // Assuming the response returns an accessToken and user info
      if (response.data && response.data.accessToken) {
        // Store token (e.g., localStorage, context, etc.)
        localStorage.setItem("accessToken", response.data.accessToken);

        // Optionally, store user details in state or context
        // Redirect to the dashboard page
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Login
        </button>
      </form>
      <p>
        New user? <button onClick={() => navigate("/register")}>Register</button>
      </p>
    </div>
  );
};

export default LoginPage;
