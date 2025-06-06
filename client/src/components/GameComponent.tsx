import React, { useEffect, useRef } from "react";
import createGame from "../game/game.ts"; 
import { useParams } from "react-router-dom";


const GameComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { officeCode } = useParams(); // Get officeCode from the URL
  const token = localStorage.getItem("accessToken") || "";

  useEffect(() => {
    if (!containerRef.current || gameRef.current || !officeCode) return;

    gameRef.current = createGame({ officeCode, token });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [officeCode, token]);

  return <div ref={containerRef} id="phaser-game" style={{ width: "100%", height: "100vh" }} />;
};

export default GameComponent;
// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";

// const GameComponent: React.FC = () => {
//   // const [chatMessages, setChatMessages] = useState<any[]>([]);
//   // const [chatInput, setChatInput] = useState("");
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const socketRef = useRef<WebSocket | null>(null);
//   const { officeCode } = useParams();
//   const token = localStorage.getItem("accessToken") || "";

//   // Set up WebSocket and handle chat message receiving
//   useEffect(() => {
//     if (officeCode && token) {
//       socketRef.current = new WebSocket(`ws://localhost:5001/office/${officeCode}`);
      
//       socketRef.current.onopen = () => {
//         console.log("WebSocket connected");
//       };

//       socketRef.current.onmessage = (event: MessageEvent) => {
//         const data = JSON.parse(event.data);
//         console.log("WebSocket message:", data);
//         // if (data.type === "chatMessage") {
//         //   setChatMessages((prevMessages) => [
//         //     ...prevMessages,
//         //     { sender: data.chatMessage.sender, message: data.chatMessage.message },
//         //   ]);
//         // }
//       };

//       socketRef.current.onerror = (error) => {
//         console.error("WebSocket error:", error);
//       };

//       socketRef.current.onclose = () => {
//         console.log("WebSocket connection closed");
//       };
//     }

//     return () => {
//       socketRef.current?.close();
//     };
//   }, [officeCode, token]);

//   const sendChatMessage = () => {
//     if (!chatInput.trim() || !token || !officeCode || !socketRef.current) return;

//     socketRef.current.send(
//       JSON.stringify({
//         type: "chatMessage",
//         chatMessage: { sender: "Player", message: chatInput },
//         officeCode,
//       })
//     );

//     setChatInput(""); // Clear input after sending
//   };

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
//       {/* Phaser Game Container */}
//       <div ref={containerRef} id="phaser-game" style={{ width: '100%', height: '100%' }} />

//       {/* Chat Box - Overlay on top of the game */}
//       <div
//         id="chatBox"
//         style={{
//           position: 'absolute',
//           top: '10px',
//           left: '10px',
//           width: '300px',
//           height: '200px',
//           backgroundColor: 'rgba(0, 0, 0, 0.7)',
//           color: 'white',
//           padding: '10px',
//           overflowY: 'scroll',
//           borderRadius: '8px',
//           zIndex: 10, // Ensure it's on top
//         }}
//       >
//         <div>
//           {chatMessages.map((chat, index) => (
//             <div key={index}>
//               <strong>{chat.sender}:</strong> {chat.message}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Input box and send button */}
//       <div
//         style={{
//           position: 'absolute',
//           bottom: '10px',
//           left: '10px',
//           display: 'flex',
//           width: 'calc(100% - 20px)',
//           maxWidth: '300px',
//         }}
//       >
//         <input
//           type="text"
//           value={chatInput}
//           onChange={(e) => setChatInput(e.target.value)}
//           placeholder="Type a message"
//           style={{
//             flex: 1,
//             padding: '10px',
//             borderRadius: '4px',
//             border: '1px solid #ccc',
//             marginRight: '5px',
//           }}
//         />
//         <button
//           onClick={sendChatMessage}
//           style={{
//             padding: '10px',
//             backgroundColor: '#4CAF50',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//           }}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GameComponent;
