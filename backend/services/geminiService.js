/**
 * Gemini API integration.
 * Set env: GEMINI_API_KEY
 * Optional: GEMINI_MODEL (default: gemini-2.0-flash)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getGeminiApiKey, cleanEnvValue } = require("../config/env");

function getPreferredModelName() {
  return cleanEnvValue(process.env.GEMINI_MODEL || "");
}

function getModelCandidates() {
  const fromEnv = cleanEnvValue(process.env.GEMINI_MODEL_CANDIDATES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
  ];

  const preferred = getPreferredModelName();
  const ordered = preferred ? [preferred, ...fromEnv, ...defaults] : [...fromEnv, ...defaults];

  // Deduplicate while preserving order.
  return [...new Set(ordered)];
}

function isModelNotFoundError(err) {
  const msg = String(err?.message || "").toLowerCase();
  return msg.includes("not found") || msg.includes("is not supported for generatecontent");
}

let genAI = null;
let activeModelName = "";

function getClient() {
  const key = getGeminiApiKey();
  if (!key) return null;
  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(key);
    } catch (err) {
      console.warn("Gemini init error:", err.message);
      return null;
    }
  }
  return genAI;
}

async function generateWithFallback(prompt) {
  const client = getClient();
  if (!client) {
    throw new Error("Gemini client is not available");
  }

  const candidates = activeModelName
    ? [activeModelName, ...getModelCandidates().filter((m) => m !== activeModelName)]
    : getModelCandidates();

  let lastError = null;

  for (const modelName of candidates) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      activeModelName = modelName;
      return result;
    } catch (err) {
      lastError = err;
      if (isModelNotFoundError(err)) {
        console.warn(`[Gemini] Model '${modelName}' unavailable, trying next candidate...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("No Gemini model candidates succeeded");
}

/**
 * Generate a short compatibility explanation for two users.
 */
async function getCompatibilityExplanation(userA, userB, matchResult) {
  if (!getClient()) return null;

  const prompt = `You are a flatmate compatibility expert. Explain in 2-3 short sentences why these two people could be good flatmates based on their lifestyle preferences. Be friendly and specific. Do not make up details not given.

User A: ${userA.name || "Unknown"}, ${userA.bio || "No bio"}. Preferences: ${JSON.stringify(userA.lifestylePreferences || {})}. Budget: ₹${userA.budgetRange?.min ?? 0}-${userA.budgetRange?.max ?? 0}k.

User B: ${userB.name || "Unknown"}, ${userB.bio || "No bio"}. Preferences: ${JSON.stringify(userB.lifestylePreferences || {})}. Budget: ₹${userB.budgetRange?.min ?? 0}-${userB.budgetRange?.max ?? 0}k.

Match score: ${matchResult.matchScore}%. Matching reasons: ${(matchResult.reasons || []).join(", ") || "None"}.

Return only the explanation text, no labels or quotes.`;

  try {
    const result = await generateWithFallback(prompt);
    const response = result.response;
    const text = response?.text?.()?.trim();
    return text || null;
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return null;
  }
}

/**
 * Gemini-powered assistant chat.
 * @param {{ messages?: Array<{role: 'user'|'assistant', text: string}>, message?: string }} payload
 */
async function getAssistantReply(payload) {
  if (!getClient()) {
    return "AI is not available right now. Please try again later.";
  }

  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const fallbackMessage = payload?.message ? String(payload.message) : "";

  const safeMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      text: String(m.text || ""),
    }))
    .filter((m) => m.text.trim().length > 0);

  const lastUser =
    fallbackMessage ||
    [...safeMessages].reverse().find((m) => m.role === "user")?.text ||
    "";

  const history = safeMessages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt =
    `You are Rumi's friendly assistant for flatmate matching.\n\n` +
    `Your goals:\n` +
    `1) Help users find compatible flatmates (based on their preferences and matching).\n` +
    `2) Explain how the matching works in simple terms.\n` +
    `3) Answer safety questions and suggest safe communication practices.\n\n` +
    `Rules:\n` +
    `- Be concise and helpful.\n` +
    `- Do not invent personal details about specific users.\n` +
    `- If the user asks for harmful or unsafe instructions, refuse and suggest safer alternatives.\n\n` +
    `Conversation so far:\n${history || "(no prior messages)"}\n\n` +
    `Now respond to the user:\nUser: ${lastUser}\nAssistant:`;

  try {
    const result = await generateWithFallback(prompt);
    const response = result.response;
    const text = response?.text?.()?.trim();
    return text || "Okay — tell me a bit more.";
  } catch (err) {
    console.error("Gemini assistant API error:", err.message);
    if (err?.response || err?.cause) {
      console.error("Details:", err.response || err.cause);
    }
    return "Sorry — I could not generate a response. Please try again.";
  }
}

module.exports = {
  getCompatibilityExplanation,
  getAssistantReply,
};
