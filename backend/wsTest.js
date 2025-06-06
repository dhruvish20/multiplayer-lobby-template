const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:5000"); // Connect to the WebSocket server

ws.on("open", () => {
  console.log("Connected to WebSocket server");

  // Send a test message after connection
  ws.send(JSON.stringify({ message: "Hello, WebSocket Server!" }));
});

ws.on("message", (data) => {
  console.log("Received from server:", data.toString());
});

ws.on("close", () => {
  console.log("Disconnected from WebSocket server");
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});
