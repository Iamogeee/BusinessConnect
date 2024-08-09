const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const setWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const token = new URLSearchParams(req.url.split("?")[1]).get("token");
    if (!token) {
      ws.close();
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification failed:", err);
        ws.close();
        return;
      }

      ws.user = user;

      ws.on("message", (message) => {
        // Handle received message
      });

      ws.on("close", () => {
        // Handle WebSocket connection close
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });
  });

  const notifyUser = (userId, message) => {
    wss.clients.forEach((client) => {
      if (client.user && client.user.id === userId) {
        client.send(JSON.stringify(message));
      }
    });
  };
  return notifyUser;
};

module.exports = { setWebSocketServer };
