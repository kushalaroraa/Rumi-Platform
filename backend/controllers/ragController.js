const { getRAGReply } = require("../services/ragService");

/**
 * Controller for RAG-based chat operations.
 */

async function handleChat(req, res) { //handles HTTP req from frontend
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string." });
    }

    const reply = await getRAGReply(message); //send message to rag service
    
    res.json({ reply }); //returns generated response to frontend
  } catch (error) {
    console.error("ragController error:", error.message);
    res.status(500).json({
      reply: "I encountered a technical issue. Please try again later.",
      error: error.message
    });
  }
}

module.exports = {
  handleChat,
};
