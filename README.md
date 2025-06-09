# 🧩 # 🎮 LobbyBase — Real-Time Multiplayer Starter Kit

A scalable real-time multiplayer **lobby system template** — built with **React**, **Phaser**, **Node.js**, **WebSockets**, and **JWT Auth**.

This repo is intended as a **starter kit** for multiplayer developers.  
You can fork and add chat, games, video, avatars, or anything interactive.

> 🎯 Designed for extensibility and performance

---

## 🎬 Demo (Coming Soon)

> A short demo showing two players joining a lobby and moving in real-time will be added here.

---

## 🚀 Features

- 🔒 Secure login with JWT (access + refresh tokens)
- 🧠 MongoDB for user management
- 💡 Redis cache (minimal DB reads)
- 📡 Real-time player sync via WebSockets
- 🕹 Built on Phaser 3 game engine
- 🌐 Modular folder structure
- ✅ Battle-tested with 600 virtual users (see below)

---
## 🖼️ Screenshots

### 🧑‍💼 Virtual Office View  
![Game View](./assests/demo_screenshot1.png)

### 💬 In-Game Chat  
![Chat Feature](./assests/demo_screenshot2.png)

### 👥 Multiplayer + Messaging  
![Player Interaction](./assests/demo_screenshot3.png)

---
## 📊 Performance Benchmark

Load tested with [Artillery](https://artillery.io) on a MacBook Air (M1, 8GB RAM).

- 🧑‍🤝‍🧑 600 simulated players
- 💬 1,200 WebSocket messages
- ⚡ 40 msg/sec throughput
- ❌ 0 failures
- 🔁 Session length: ~5s per user

![Benchmark Chart](./benchmark/artillery_performance_chart.png)

---

