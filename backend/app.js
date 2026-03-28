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

module.exports = app;