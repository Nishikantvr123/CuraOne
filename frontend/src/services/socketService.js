// src/services/socketService.js
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.serverUrl = null;
  }

  // Initialize Socket.IO
  connect(userId) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Force correct backend port (your backend = :8000)
    const protocol = window.location.protocol; // http:// or https://
    const hostname = window.location.hostname;
    this.serverUrl = `${protocol}//${hostname}:8000`;

    console.log("Connecting to Socket.IO server:", this.serverUrl);

    // Socket.io client
    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 3000,
      timeout: 20000,
    });

    this._setupListeners(userId);
    return this.socket;
  }

  // Attach event listeners
  _setupListeners(userId) {
    if (!this.socket) return;

    // CONNECTED
    this.socket.on("connect", () => {
      console.log("🟢 Socket connected:", this.socket.id);
      this.isConnected = true;

      if (userId) {
        this.socket.emit("join", userId);
        console.log("Joined personal room:", userId);
      }

      this.emit("connected");
    });

    // INTENTIONAL FIX: Avoid false disconnect toasts
    this.socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      this.isConnected = false;

      // Only call "disconnected" if not auto-reconnected shortly
      setTimeout(() => {
        if (!this.socket || !this.socket.connected) {
          this.emit("disconnected", { reason });
        }
      }, 1500);
    });

    // RECONNECT
    this.socket.on("reconnect", (attempt) => {
      console.log("🟢 Reconnected after", attempt, "attempts");
      this.isConnected = true;
      this.emit("connected");
    });

    // RECONNECT ERROR
    this.socket.on("reconnect_error", (err) => {
      console.error("Reconnect error:", err.message);
    });

    // CONNECTION ERROR
    this.socket.on("connect_error", (err) => {
      console.error("🚨 Connection error:", err.message);
      this.isConnected = false;
    });

    // NOTIFICATION EVENTS
    this.socket.on("notification", (data) => {
      console.log("🔔 Notification:", data);
      this.emit("notification", data);
    });

    this.socket.on("booking_update", (data) => {
      console.log("📅 Booking update:", data);
      this.emit("booking_update", data);
    });

    this.socket.on("wellness_update", (data) => {
      console.log("❤️ Wellness update:", data);
      this.emit("wellness_update", data);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit events to backend
  sendBookingUpdate(userId, message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("booking_update", {
        userId,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  sendWellnessUpdate(practitionerId, patientName) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("wellness_update", {
        practitionerId,
        patientName,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Event listener system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const arr = this.listeners.get(event);
      const index = arr.indexOf(callback);
      if (index >= 0) arr.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in ${event} listener:`, e);
        }
      });
    }
  }

  isConnectedToServer() {
    return this.isConnected;
  }

  getSocketId() {
    return this.socket?.id || null;
  }

  joinRoom(roomName) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_room", roomName);
    }
  }

  leaveRoom(roomName) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave_room", roomName);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
