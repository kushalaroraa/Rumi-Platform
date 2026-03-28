require("./config/env");
const { logGeminiKeyStatus } = require("./config/env");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 9090;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Assistant: POST http://localhost:${PORT}/assistant/chat`);
  logGeminiKeyStatus();
});