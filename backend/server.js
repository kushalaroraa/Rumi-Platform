require("./config/env");
require('dotenv').config();
const { logGeminiKeyStatus } = require("./config/env");
const path = require("path");
const dotenv = require("dotenv");


dotenv.config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 9090;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Assistant: POST http://localhost:${PORT}/assistant/chat`);
  logGeminiKeyStatus();
});