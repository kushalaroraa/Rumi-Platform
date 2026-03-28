const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: 3
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6
  },
  phone: { 
    type: String, 
    trim: true 
 },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, {
    timestamps: true
}
);

module.exports = mongoose.model("User", userSchema);