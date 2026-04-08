const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔥 Chat logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const mongoose = require("mongoose");

  mongoose.connect("YOUR_MONGO_URL");

  const Message = mongoose.model("Message", {
    room: String,
    author: String,
    message: String,
    time: String,
  });

  // Join room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Send message
  socket.on("send_message", async (data) => {
  const newMsg = new Message(data);
  await newMsg.save(); // 💾 save

  io.in(data.room).emit("receive_message", data);
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

socket.on("get_messages", async (room) => {
  const messages = await Message.find({ room });
  socket.emit("load_messages", messages);
});

// ⚠️ IMPORTANT (Render compatibility)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});