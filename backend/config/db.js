const mongoose= require("mongoose");
try {
  mongoose.set('returnDocument', 'after');
  // Fail fast on queries when DB is unavailable instead of buffering forever.
  mongoose.set('bufferCommands', false);
} catch (e) {

}

const connectDB = async () => {
  try {
    const MONGO_USERNAME = process.env.MONGO_USERNAME;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
    const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

    if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_DB_NAME) {
      throw new Error("Missing MongoDB env vars. Required: MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB_NAME");
    }

    const MONGO_URI = `mongodb+srv://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PASSWORD)}@cluster0.mqvzogk.mongodb.net/${encodeURIComponent(MONGO_DB_NAME)}?appName=Cluster0`;

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