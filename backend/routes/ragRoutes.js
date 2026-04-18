const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/ragController");

/**
 * Route for RAG chatbot.
 * POST /api/rag/chat
 */
router.post("/chat", handleChat);

module.exports = router;
