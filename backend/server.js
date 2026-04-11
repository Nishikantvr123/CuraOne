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
// ❌ import { migrateDatabase } from './utils/migrateDb.js'; (REMOVED)

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
import patientDashboardRoutes from './routes/patientDashboard.js';
import adminRoutes from './routes/admin.js';

import { auditMiddleware } from './middleware/auditMiddleware.js';

dotenv.config();

const app = express();
const server = createServer(app);

// -------------------- CORS --------------------
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:5173",
  "http://192.168.1.9:5001",
  "http://192.168.1.20:5000",
  "https://curaone.netlify.app"
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
  })
);

// -------------------- SOCKET.IO --------------------
const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }
});

// -------------------- SECURITY --------------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// -------------------- RATE LIMIT --------------------
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

// -------------------- PARSERS --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// -------------------- LOGGING --------------------
app.use(morgan("dev"));

// Attach socket to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// -------------------- AUDIT --------------------
app.use(auditMiddleware);

// -------------------- HEALTH --------------------
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CuraOne API is running",
  });
});

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/patient/dashboard", patientDashboardRoutes);
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
app.use("/api/admin", adminRoutes);

app.use("/uploads", express.static("uploads"));

// -------------------- SOCKET EVENTS --------------------
io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("booking_update", (data) => {
    socket.to(`user_${data.userId}`).emit("notification", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// -------------------- ERROR HANDLING --------------------
app.use(notFound);
app.use(errorHandler);

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // ✅ MongoDB connection

    server.listen(PORT, () => {
      console.log(`
🚀 Server running on port ${PORT}
✅ MongoDB Connected
      `);
    });

  } catch (error) {
    console.error("❌ Server start failed:", error.message);
  }
};

startServer();

export default app;