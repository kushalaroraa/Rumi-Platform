const express = require("express");
const router = express.Router();

const { registerUser, loginUser, startGoogleLogin, handleGoogleCallback } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/google", startGoogleLogin);
router.get("/google/callback", handleGoogleCallback);

module.exports = router;
