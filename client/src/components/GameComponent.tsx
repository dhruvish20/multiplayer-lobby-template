import React, { useEffect, useRef, useState } from "react";
import createGame from "../game/game.ts";
import { useParams } from "react-router-dom";

interface ChatMessage {
  sender: string;
  message: string;
}

function getUsernameFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username || "Player";
  } catch {
    return "Player";
  }
}

const GameComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const { officeCode } = useParams();
  const token = localStorage.getItem("accessToken") || "";
  const username = getUsernameFromToken(token);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!containerRef.current || gameRef.current || !officeCode) {
      console.warn("Game not initialized:", { officeCode });
      return;
    }

    gameRef.current = createGame({ officeCode, token, username});

    const handleChatMessage = (e: Event) => {
      const customEvent = e as CustomEvent<ChatMessage>;
      setChatMessages((prev) => [...prev, customEvent.detail]);
    };

    window.addEventListener("chatMessage", handleChatMessage);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      window.removeEventListener("chatMessage", handleChatMessage);
    };
  }, [officeCode, token]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    chatScrollRef.current?.scrollTo(0, chatScrollRef.current.scrollHeight);
  }, [chatMessages]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const chatEvent = new CustomEvent("outgoingChatMessage", {
      detail: {
        sender: username,
        message: chatInput,
      },
    });
    window.dispatchEvent(chatEvent);
    setChatInput("");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={containerRef} id="phaser-game" style={{ width: "100%", height: "100%" }} />

      {/* Chat Overlay */}
      <div
        style={{
          position: "absolute",
          left: "10px",
          bottom: "10px",
          width: "300px",
          height: "250px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          padding: "10px",
        }}
      >
        <div
          ref={chatScrollRef}
          style={{ flex: 1, overflowY: "auto", marginBottom: "10px" }}
        >
          {chatMessages.map((chat, idx) => (
            <div key={idx}>
              <strong style={{ color: chat.sender === username ? "#00d8ff" : "#ffa726" }}>
                {chat.sender}:
              </strong>{" "}
              {chat.message}
            </div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginRight: "4px",
            }}
          />
          <button
            onClick={sendChatMessage}
            style={{
              padding: "6px 12px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
