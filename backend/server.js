const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./config/db");

function cleanEnvValue(value) {
  if (value == null) return "";
  const s = String(value).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function logGeminiKeyStatus() {
  const key = cleanEnvValue(process.env.GEMINI_API_KEY);
  if (!key) {
    console.warn(
      "[env] GEMINI_API_KEY is empty -- set it in backend/.env (see .env.example)"
    );
    return;
  }
  console.log(`[env] GEMINI_API_KEY loaded (${key.length} characters)`);
}

const PORT = process.env.PORT || 9090;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Assistant: POST http://localhost:${PORT}/assistant/chat`);
  logGeminiKeyStatus();
});
