const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

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

function loadBackendEnv() {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    console.error(`[env] Missing file: ${envPath}`);
    console.error("[env] Create it from .env.example or add GEMINI_API_KEY=...");
    return;
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error("[env] Failed to load .env:", result.error.message);
  }
}

function logGeminiKeyStatus() {
  const key = cleanEnvValue(process.env.GEMINI_API_KEY);
  if (!key) {
    console.warn(
      "[env] GEMINI_API_KEY is empty - set it in backend/.env (see .env.example)"
    );
    return;
  }

  console.log(`[env] GEMINI_API_KEY loaded (${key.length} characters)`);
}

loadBackendEnv();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 9090;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Assistant: POST http://localhost:${PORT}/assistant/chat`);
  logGeminiKeyStatus();
});