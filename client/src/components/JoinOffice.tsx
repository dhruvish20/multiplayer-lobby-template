// src/components/JoinOffice.tsx
import React, { useState } from "react";
import { joinOffice } from "../services/api.ts";

const JoinOffice = () => {
  const [officeCode, setOfficeCode] = useState("");

  const handleJoinOffice = async () => {
    try {
      const response = await joinOffice(officeCode);
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
