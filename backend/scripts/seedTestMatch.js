const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("../config/db");
const User = require("../models/User");
const { Request } = require("../models/Request");
const Message = require("../models/Message");

async function seed() {
  console.log("Seeding test match...");
  const connected = await connectDB();
  if (!connected) {
    console.error("DB connection failed");
    process.exit(1);
  }

  try {
    // Delete existing test data
    await User.deleteMany({ email: { $in: ["alice@example.com", "bob@example.com"] } });
    
    const passwordHash = await bcrypt.hash("password123", 10);

    const alice = await User.create({
      name: "Alice",
      email: "alice@example.com",
      passwordHash,
      phone: "1234567890",
      age: 25,
      gender: "female",
      city: "Mumbai",
      profession: "student",
      intent: "find",
      budgetRange: { min: 5000, max: 15000 },
      bio: "Hi, I am Alice! I love reading and peaceful spaces.",
      profileCompleted: true,
      verificationStatus: { emailVerified: true, phoneVerified: true, aadharVerified: true }
    });

    const bob = await User.create({
      name: "Bob",
      email: "bob@example.com",
      passwordHash,
      phone: "0987654321",
      age: 27,
      gender: "male",
      city: "Mumbai",
      profession: "working",
      intent: "find",
      budgetRange: { min: 6000, max: 18000 },
      bio: "Hey, I am Bob! I love outdoor activities and keep things clean.",
      profileCompleted: true,
      verificationStatus: { emailVerified: true, phoneVerified: true, aadharVerified: true }
    });

    console.log(`Created users: Alice (${alice._id}), Bob (${bob._id})`);

    // Clean old requests or messages
    await Request.deleteMany({
      $or: [
        { fromUserId: alice._id, toUserId: bob._id },
        { fromUserId: bob._id, toUserId: alice._id }
      ]
    });

    await Message.deleteMany({
      $or: [
        { senderId: alice._id, receiverId: bob._id },
        { senderId: bob._id, receiverId: alice._id }
      ]
    });

    // Create accepted request
    const request = await Request.create({
      fromUserId: alice._id,
      toUserId: bob._id,
      status: "accepted",
      respondedAt: new Date()
    });

    console.log(`Created accepted request: ${request._id}`);
    console.log("Seeding completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
