import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { migrateDatabase } from './utils/migrateDb.js';

import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import wellnessRoutes from './routes/wellness.js';
import therapyRoutes from './routes/therapies.js';
import feedbackRoutes from './routes/feedback.js';
import notificationRoutes from './routes/notifications.js';
import auditRoutes from './routes/audit.js';
import chatRoutes from './routes/chat.js';
import prescriptionRoutes from './routes/prescriptions.js';
import paymentRoutes from './routes/payments.js';
import inventoryRoutes from './routes/inventory.js';
import doshaRoutes from './routes/dosha.js';
import patientRoutes from './routes/patients.js';

import { auditMiddleware } from './middleware/auditMiddleware.js';

dotenv.config();

const app = express();
const server = createServer(app);

// -------------------- FIXED CORS (LAN + localhost + Netlify) --------------------
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",     // FRONTEND (Vite dev server)
  "http://localhost:5001",
  "http://localhost:5173",     // Vite default port
  "http://192.168.1.9:5001",   // FRONTEND IP
  "http://192.168.1.20:5000",  // BACKEND IP
  "https://curaone.netlify.app" // Your Netlify frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ CORS blocked origin:", origin);
      return callback(new Error("CORS Error: " + origin), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------- FIXED SOCKET.IO CORS + UPGRADE --------------------
const io = new Server(server, {
  transports: ["websocket", "polling"],
  allowUpgrades: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// -------------------- DB + MIGRATION --------------------
await connectDB();
await migrateDatabase();

// -------------------- SECURITY --------------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// -------------------- RATE LIMIT --------------------
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

// -------------------- PARSERS --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -------------------- LOGGING --------------------
app.use(morgan("dev"));

// Attach socket to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// -------------------- AUDIT LOGGER --------------------
app.use(auditMiddleware);

// -------------------- HEALTH CHECK --------------------
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CuraOne API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/therapies", therapyRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dosha", doshaRoutes);

app.use("/uploads", express.static("uploads"));

// -------------------- SOCKET EVENTS --------------------
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📌 User ${userId} joined their room`);
  });

  socket.on("booking_update", (data) => {
    socket.to(`user_${data.userId}`).emit("notification", {
      type: "booking",
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("wellness_update", (data) => {
    if (data.practitionerId) {
      socket.to(`user_${data.practitionerId}`).emit("notification", {
        type: "wellness",
        message: `${data.patientName} updated wellness`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------- ERROR HANDLING --------------------
app.use(notFound);
app.use(errorHandler);

// -------------------- START SERVER (IMPORTANT FIX) --------------------
// ⚠ We REMOVE "0.0.0.0" so Node binds to BOTH IPv4 + IPv6 automatically.
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`
🚀 CuraOne Backend Server is running!
📍 Port: ${PORT}
⚡ Socket.IO: Enabled (LAN + localhost)
🌐 API Health: http://192.168.1.20:${PORT}/api/health
  `);
});

export default app;
