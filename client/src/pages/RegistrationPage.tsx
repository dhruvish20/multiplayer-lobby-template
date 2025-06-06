import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post("http://localhost:5001/auth/register", {
        email,
        password,
      });

      if (response.status === 201) {
        alert("Registration successful! Please log in.");
        navigate("/"); // Redirect to login page
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
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
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Register</button>
      </form>
      <p>
        Already have an account? <button onClick={() => navigate("/")}>Login</button>
      </p>
    </div>
  );
};

export default RegisterPage;
