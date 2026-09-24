import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/attachments", attachmentRoutes);


connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "AI Support Engineering Platform API is running"
    });
});

const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://ai-support-engineering-platform-client.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinTicket", (ticketId) => {
    socket.join(`ticket-${ticketId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };