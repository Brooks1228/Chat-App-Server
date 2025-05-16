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

  socket.on("message", (msgText) => {
    console.log("message revieved: ", msgText);
    const msg = {
      user: socket.username || "anonymous",
      text: msgText,
      room: socket.room || "global",
    };
    messages.push(msg);
    if (messages.length > 20) {
      messages.shift();
    }
    console.log(messages);

    if (socket.room) {
      io.to(socket.room).emit("message", msg);
    } else {
      socket.emit("message", {
        user: "👤 system",
        text: "you must join a room first",
      });
    }

    //io.emit("message", msg);
  });

  socket.on("image", (image) => {
    io.emit("image", image);
  });

  socket.on("getLastMessages", () => {
    // const lastMessages = messages.slice(-20);
    socket.emit("lastMessages", messages);
  });

  socket.on("triggerConfetti", () => {
    io.emit("playConfetti");
  });

  socket.on("joinRoom", ({ username, room }) => {
    socket.username = username;
    socket.room = room;
    socket.join(room);
    console.log(`${username} joined room ${room}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ server running on port ${PORT}`);
});
