const mongoose= require("mongoose");
try {
  mongoose.set('returnDocument', 'after');
  // Fail fast on queries when DB is unavailable instead of buffering forever.
  mongoose.set('bufferCommands', false);
} catch (e) {

}

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

function buildMongoUri() {
  const explicitUri = cleanEnvValue(process.env.MONGODB_URI || process.env.MONGO_URI);
  if (explicitUri) return explicitUri;

  const username = cleanEnvValue(process.env.MONGO_USERNAME);
  const password = cleanEnvValue(process.env.MONGO_PASSWORD);
  const dbName = cleanEnvValue(process.env.MONGO_DB_NAME);

  if (!username || !password || !dbName) {
    throw new Error(
      "Missing MongoDB env vars. Set MONGODB_URI or MONGO_URI, or provide MONGO_USERNAME, MONGO_PASSWORD, and MONGO_DB_NAME."
    );
  }

  return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@cluster0.mqvzogk.mongodb.net/${encodeURIComponent(dbName)}?appName=Cluster0`;
}

const connectDB = async () => {
  try {
    const MONGO_URI = buildMongoUri();
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.warn("MongoDB unavailable. API server will keep running; DB-backed routes may return 500 until DB reconnects.");
    return false;
  }
};

module.exports = connectDB;
