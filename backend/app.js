require("./config/env");
const express = require("express");
const cors = require("cors");
const { getAssistantReply } = require("./services/geminiService");

const app = express();

app.use(cors());
app.use(express.json());

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
app.use('/auth', authRoutes); // match frontend /auth/register and /auth/login

// Example admin-only route to verify role-based access
const { authenticate, authorize } = require('./middleware/authMiddleware');
app.get('/api/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ success: true, message: `Hello Admin ${req.user.name || ''}` });
});

module.exports = app;