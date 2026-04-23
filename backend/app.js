const express = require("express");
const cors = require("cors");
const path = require("path");
const { getAssistantReply } = require("./services/geminiService");

const app = express();

// ✅ Allowed origins setup
const clientUrl = (process.env.CLIENT_URL || "").replace(/\/$/, "");

const allowedOrigins = [
  clientUrl,
  "https://rumi-platform.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
].filter(Boolean);

// ✅ CORS config (dynamic + safe)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === "development"
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Static uploads
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// ✅ Gemini assistant
app.post("/assistant/chat", async (req, res) => {
  try {
    const reply = await getAssistantReply(req.body || {});
    res.json({ reply });
  } catch (err) {
    console.error("assistant/chat:", err);
    res.status(500).json({
      reply: "Sorry — something went wrong. Please try again.",
      error: err.message,
    });
  }
});

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);
app.use("/api/user", userRoutes);

const ragRoutes = require("./routes/ragRoutes");
app.use("/api/rag", ragRoutes);

const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

const requestRoutes = require("./routes/requestRoutes");
const matchRoutes = require("./routes/matchRoutes");
app.use("/api/request", requestRoutes);
app.use("/api/matches", matchRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

// ✅ Admin route
const { authenticate, authorize } = require("./middleware/authMiddleware");

app.get(
  "/api/admin",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    res.json({
      success: true,
      message: `Hello Admin ${req.user.name || ""}`,
    });
  }
);

module.exports = app;