import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server, WebSocket } from "ws";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import officeRoutes from "./routes/office";
import errorHandler from "./middleware/errorhandler";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/office", officeRoutes);
app.use(errorHandler);
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create a WebSocket server
const wss = new Server({ server });

const players: Record<string, Record<string, { id: string; username: string; position: { x: number; y: number } }>> = {};

wss.on("connection", (ws) => {
  const clientId = uuidv4();
  let officeCode: string | null = null;
  let username: string | null = null;

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Received:", message);

      switch (message.type) {
        case "joinOffice":
          officeCode = message.officeCode;
          username = message.username;

          if (!players[officeCode!]) {
            players[officeCode!] = {};
          }

          if (username) {
            players[officeCode!][clientId] = { id: clientId, username, position: { x: 450, y: 400 } }; // Initial position
          }

          // Send assigned ID to the client
          ws.send(JSON.stringify({ type: "assignId", id: clientId }));

          // Send existing players to the new player, including their positions
          const existingPlayers = Object.values(players[officeCode!]).map(player => ({
            id: player.id,
            username: player.username,
            position: player.position,
          }));
          ws.send(
            JSON.stringify({
              type: "existingPlayers",
              players: existingPlayers,
            })
          );

          // Notify others in the office about the new player
          broadcastToOffice(
            officeCode!,
            JSON.stringify({ type: "newPlayer", id: clientId, username, position: { x: 450, y: 400 } }),
            ws
          );

          console.log(`Player ${username} joined office ${officeCode}`);
          break;

          case "chatMessage":
          if (officeCode && message.chatMessage) {
            // Broadcast the chat message to all players in the office
            broadcastToOffice(
              officeCode,
              JSON.stringify({
                type: "chatMessage",
                chatMessage: message.chatMessage, // { sender, message }
              }),
              ws
            );
          }
          break;

          case "playerMovement":
            if (officeCode) {
              // Update the player's position on the server
              players[officeCode][clientId].position.x = message.x;
              players[officeCode][clientId].position.y = message.y;
              
              // Broadcast the new position to all clients in the office
              broadcastToOffice(
                officeCode,
                JSON.stringify({
                  type: "playerMovement",
                  id: clientId,
                  x: message.x,
                  y: message.y,
                }),
                ws
              );
            }
            break;
          
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    if (officeCode && players[officeCode]) {
      delete players[officeCode][clientId];

      // Notify others in the office that the player left
      broadcastToOffice(
        officeCode,
        JSON.stringify({ type: "removePlayer", id: clientId }),
        ws
      );

      console.log(`Client ${clientId} disconnected from office ${officeCode}`);
    }
  });
});

// Helper function to broadcast messages to a specific office
function broadcastToOffice(officeCode: string, message: string, sender: WebSocket) {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
