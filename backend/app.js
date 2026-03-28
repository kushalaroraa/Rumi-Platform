const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Mount API routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Example admin-only route to verify role-based access
const { authenticate, authorize } = require('./middleware/authMiddleware');
app.get('/api/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ success: true, message: `Hello Admin ${req.user.name || ''}` });
});

module.exports = app;