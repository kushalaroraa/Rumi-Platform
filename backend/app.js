const express = require("express");
const cors = require("cors");
const { getAssistantReply } = require("./services/geminiService");

const app = express();

const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
const allowedOrigins = [
  clientUrl,
  "https://rumi-platform.vercel.app",
  "http://localhost:5173", // Vite default
  "http://localhost:3000"  // CRA default
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // Use standard falsy response instead of an error to prevent preflight crashes
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve uploaded files (profile photos) from /uploads
const path = require('path');
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Gemini assistant (landing page chatbot)
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
// Mount API routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// User profile routes (no /api prefix because frontend calls /user/... )
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// RAG chatbot routes
const ragRoutes = require('./routes/ragRoutes');
app.use('/api/rag', ragRoutes);

// Room management routes
const roomRoutes = require('./routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

// Match and request routes
const requestRoutes = require('./routes/requestRoutes');
const matchRoutes = require('./routes/matchRoutes');
app.use('/api/request', requestRoutes);
app.use('/api/matches', matchRoutes);

// Cloudinary upload routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Example admin-only route to verify role-based access
const { authenticate, authorize } = require('./middleware/authMiddleware');
app.get('/api/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ success: true, message: `Hello Admin ${req.user.name || ''}` });
});

module.exports = app;