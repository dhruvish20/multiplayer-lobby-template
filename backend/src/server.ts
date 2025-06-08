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

// -- Custom Type for WebSocket with metadata --
interface CustomWebSocket extends WebSocket {
  clientId?: string;
  officeCode?: string;
}

// -- WebSocket Server --
const wss = new Server({ server });

// -- In-memory player store --
const players: Record<string, Record<string, {
  id: string;
  username: string;
  position: { x: number; y: number };
}>> = {};

wss.on("connection", (socket) => {
  const ws = socket as CustomWebSocket;
  const clientId = uuidv4();
  ws.clientId = clientId;

  let username: string | null = null;

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "joinOffice": {
          const officeCode = message.officeCode;
          username = message.username;
          ws.officeCode = officeCode;

          if (!players[officeCode]) players[officeCode] = {};

          players[officeCode][clientId] = {
            id: clientId,
            username: username || "Unknown",
            position: { x: 450, y: 400 },
          };

          ws.send(JSON.stringify({ type: "assignId", id: clientId }));

          const existingPlayers = Object.values(players[officeCode]);
          ws.send(JSON.stringify({ type: "existingPlayers", players: existingPlayers }));

          broadcastToOffice(
            officeCode,
            JSON.stringify({
              type: "newPlayer",
              id: clientId,
              username,
              position: { x: 450, y: 400 },
            })
          );
          break;
        }

        case "chatMessage": {
          if (ws.officeCode && message.chatMessage) {
            broadcastToOffice(
              ws.officeCode,
              JSON.stringify({
                type: "chatMessage",
                chatMessage: message.chatMessage,
              })
            );
          }
          break;
        }

        case "playerMovement": {
          const officeCode = ws.officeCode;
          if (officeCode && players[officeCode] && players[officeCode][clientId]) {
            players[officeCode][clientId].position = { x: message.x, y: message.y };

            broadcastToOffice(
              officeCode,
              JSON.stringify({
                type: "playerMovement",
                id: clientId,
                x: message.x,
                y: message.y,
                username: players[officeCode][clientId].username,
              })
            );
          }
          break;
        }
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    const officeCode = ws.officeCode;
    if (officeCode && players[officeCode]) {
      delete players[officeCode][clientId];

      broadcastToOffice(
        officeCode,
        JSON.stringify({ type: "removePlayer", id: clientId })
      );

      console.log(`Client ${clientId} disconnected from office ${officeCode}`);
    }
  });
});

// -- Broadcast to a specific office only --
function broadcastToOffice(officeCode: string, message: string) {
  wss.clients.forEach((client) => {
    const ws = client as CustomWebSocket;
    if (ws.readyState === WebSocket.OPEN && ws.officeCode === officeCode) {
      ws.send(message);
    }
  });
}
