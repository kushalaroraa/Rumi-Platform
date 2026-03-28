/**
 * Load backend/.env once, from a path that does not depend on the shell cwd.
 * Must be required before any code that reads process.env.
 *
 * Note: In .env files, values containing $ must be quoted, e.g. MONGO_PASSWORD="pass$123"
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env");

if (!fs.existsSync(envPath)) {
  console.error(`[env] Missing file: ${envPath}`);
  console.error("[env] Create it from .env.example or add GEMINI_API_KEY=...");
} else {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error("[env] Failed to load .env:", result.error.message);
  }
}

/** Strip accidental surrounding quotes from dotenv values */
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

function getGeminiApiKey() {
  return cleanEnvValue(process.env.GEMINI_API_KEY);
}

function logGeminiKeyStatus() {
  const key = getGeminiApiKey();
  if (!key) {
    console.warn(
      "[env] GEMINI_API_KEY is empty — set it in backend/.env (see .env.example)"
    );
    return;
  }
  console.log(`[env] GEMINI_API_KEY loaded (${key.length} characters)`);
}

module.exports = {
  getGeminiApiKey,
  logGeminiKeyStatus,
  cleanEnvValue,
};
