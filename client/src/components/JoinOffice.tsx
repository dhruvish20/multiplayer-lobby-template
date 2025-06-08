// src/components/JoinOffice.tsx
import React, { useState } from "react";
import { joinOfficeAPI } from "../services/officeService";

const JoinOffice = () => {
  const [officeCode, setOfficeCode] = useState("");

  const handleJoinOffice = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await joinOfficeAPI(officeCode, token);
      alert(`Joined office: ${response.officeName}`);
    } catch (error) {
      alert("Failed to join office.");
    }
  };

  return (
    <div>
      <h2>Join an Office</h2>
      <input
        type="text"
        value={officeCode}
        onChange={(e) => setOfficeCode(e.target.value)}
        placeholder="Enter Office Code"
      />
      <button onClick={handleJoinOffice}>Join</button>
    </div>
  );
};

export default JoinOffice;
