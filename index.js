const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const messages = [];

io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });

  socket.on("message", (msg) => {
    messages.push(msg);
    io.emit("message", msg);
  });

  socket.on("image", (image) => {
    io.emit("image", image);
  });

  socket.on("getLastMessages", () => {
    const lastMessages = messages.slice(-20);
    socket.emit("lastMessages", lastMessages);
  });

  socket.on("triggerConfetti", () => {
    io.emit("playConfetti");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ server running on port ${PORT}`);
});
