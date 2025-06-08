import React, { useState } from "react";
import { createOfficeAPI } from "../services/officeService.ts";

const CreateOffice = () => {
  const [officeName, setOfficeName] = useState("");

  const handleCreateOffice = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await createOfficeAPI(officeName, token);
      alert(`Office created! Code: ${response.officeCode}`);
    } catch (error) {
      alert("Failed to create office.");
    }
  };

  return (
    <div>
      <h2>Create an Office</h2>
      <input
        type="text"
        value={officeName}
        onChange={(e) => setOfficeName(e.target.value)}
        placeholder="Enter Office Name"
      />
      <button onClick={handleCreateOffice}>Create</button>
    </div>
  );
};

export default CreateOffice;
