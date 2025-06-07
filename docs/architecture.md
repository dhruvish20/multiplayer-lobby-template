# 🌟 Project Architecture: LobbyBase - Real-Time Multiplayer Starter Kit

## 🌍 Project Purpose

LobbyBase is a real-time multiplayer lobby system built to serve as a foundation for session-based multiplayer experiences. The goal is to provide a scalable, modular system where users can join lobbies, see each other in real time, and build further features like chat, games, or collaboration tools. The architecture emphasizes performance, simplicity, and extendability.

---

## 🪧 System Overview

- **Frontend:** React + TypeScript + Phaser 3
- **Backend:** Node.js + Express + WebSocket (`ws`)
- **Authentication:** JWT (Access + Refresh Tokens)
- **Database:** MongoDB
- **Cache Layer:** Redis
- **Transport:** WebSocket (Session-based)

### Component Diagram (Conceptual)

```text
+-------------+      +--------------+     +------------+
|   Browser   | <--> |  WebSocket   | <-> |  Redis     |
| (Phaser UI) |      |   Server     |     | (Sessions) |
+-------------+      +--------------+     +------------+
                             |
                             v
                        +---------+
                        | MongoDB |
                        +---------+
```

---

## 🔐 Authentication Flow (JWT)

1. User registers or logs in via REST endpoint (`/auth/login`, `/auth/register`).
2. Backend validates credentials and issues:
   - `accessToken` (short-lived, stored in memory/localStorage)
   - `refreshToken` (long-lived, stored in `HttpOnly` cookie)
3. All protected HTTP routes and WebSocket connections require the access token.
4. WebSocket connections attach the token as a query parameter.

---

## 📡 WebSocket Session Flow

### Connection

- Client opens a WebSocket connection with parameters: `?officeCode=<code>&token=<jwt>`
- Server validates the JWT and parses the `officeCode`
- A new player is added to the `players[officeCode]` object
- A unique `clientId` and starting position `{x, y}` are assigned

### Message Types

- `joinOffice` – Joins the office and notifies others
- `existingPlayers` – Sent to new player with list of who is already present
- `newPlayer` – Broadcast to others
- `playerMovement` – Updates and broadcasts movement
- `removePlayer` – Informs others that someone left

### Broadcast Strategy

- All player updates are **broadcast to other players** in the same lobby
- Broadcast avoids echoing back to sender
- Critical updates only; avoids flooding

---

## 🧠 Session Management with Redis

### Why Redis?

- Redis is used for low-latency session caching
- Avoids unnecessary MongoDB queries on player join/leave
- Ensures quick access to active session data

### What’s Stored?

Each player session is cached with:

```json
session:<officeCode>:<playerId> => {
  "username": "Dhruvish",
  "position": { "x": 450, "y": 400 }
}
```

### On Disconnect

- Player is removed from Redis
- `removePlayer` broadcasted to others
- MongoDB is not touched during this flow

---

## 📊 Performance Benchmark Summary

- Load-tested with **600 virtual users** using Artillery
- **0 failed sessions**
- **1,200 WebSocket messages** processed
- **40 messages/sec** sustained throughput
- Redis significantly reduced DB load

Test environment: MacBook Air M1, 8GB RAM, Node 20, local MongoDB + Redis

---

## ⚡ System Behavior in Production

| Scenario              | Behavior                                        |
| --------------------- | ----------------------------------------------- |
| Token invalid/expired | Connection rejected or kicked mid-session       |
| Redis down            | Fallback to memory only (optional to implement) |
| MongoDB slow          | Does not affect movement or lobby syncing       |
| WebSocket error       | Caught and handled with disconnect cleanup      |

---

## 🌐 Extensibility

| Feature        | How to Add                                |
| -------------- | ----------------------------------------- |
| Chat           | Enable `chatMessage` in WebSocket handler |
| Video Calls    | Add WebRTC + socket signaling             |
| Custom Avatars | Attach sprite data in player session      |
| Room switching | Track multiple lobbies in memory + Redis  |
| Score tracking | Persist stats to MongoDB                  |

---

## 📄 Conclusion

LobbyBase is designed as a plug-and-play multiplayer foundation. It separates rendering (Phaser) from communication (WebSocket) and state (Redis), making it both easy to extend and scalable under load. With JWT security, Redis-backed sessions, and a fully modular layout, it serves as a high-quality base for real-time applications.

---

