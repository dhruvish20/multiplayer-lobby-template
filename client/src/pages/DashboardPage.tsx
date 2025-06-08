import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createOfficeAPI, joinOfficeAPI } from "../services/officeService.ts";

const DashboardPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken") || "";

  const [createdOffice, setCreatedOffice] = useState<{ code: string } | null>(null);
  const [createError, setCreateError] = useState("");

  const [officeCode, setOfficeCode] = useState("");
  const [joinError, setJoinError] = useState("");

  // Create Office with default or random name
  const handleCreateOffice = async () => {
    setCreateError("");
    setCreatedOffice(null);

    try {
      const office = await createOfficeAPI("Office", token); // name hardcoded
      setCreatedOffice(office);
    } catch (error: any) {
      setCreateError(error.response?.data?.error || "Failed to create office.");
    }
  };

  const handleJoinOffice = async (e: FormEvent) => {
    e.preventDefault();
    setJoinError("");

    try {
      const office = await joinOfficeAPI(officeCode, token);
      navigate(`/game/${office.code}`);
    } catch (error: any) {
      setJoinError(error.response?.data?.error || "Failed to join office.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>

      <div style={{ marginTop: "2rem" }}>
        <h3>Create Office</h3>
        <button onClick={handleCreateOffice} style={{ padding: "0.5rem 1rem" }}>
          Create Office
        </button>
        {createError && <p style={{ color: "red" }}>{createError}</p>}

        {createdOffice && (
          <div style={{ marginTop: "1rem" }}>
            <p>
              Office created! Code:{" "}
              <input
                type="text"
                value={createdOffice.code}
                readOnly
                style={{ padding: "0.25rem", width: "150px" }}
              />
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdOffice.code);
                alert("Office code copied to clipboard!");
              }}
              style={{ padding: "0.5rem 1rem" }}
            >
              Copy Code
            </button>
            <button
              onClick={() => navigate(`/game/${createdOffice.code}`)}
              style={{ padding: "0.5rem 1rem", marginLeft: "1rem" }}
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "3rem" }}>
        <h3>Join Office</h3>
        <form onSubmit={handleJoinOffice} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Enter Office Code"
            value={officeCode}
            onChange={(e) => setOfficeCode(e.target.value)}
            required
            style={{ padding: "0.5rem", width: "250px" }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Join Office
          </button>
          {joinError && <p style={{ color: "red" }}>{joinError}</p>}
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
