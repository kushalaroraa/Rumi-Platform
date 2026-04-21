const express = require("express");
const crypto = require("crypto");
const passport = require("../config/passport");
const User = require("../models/User");
const { registerUser, loginUser } = require("../controllers/authController");
const { signToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

function getFrontendUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

function requireGoogleOAuth(req, res, next) {
  if (passport.isGoogleOAuthConfigured) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: "Google OAuth is not configured on this server."
  });
}

async function finishGoogleLogin(profile, res) {
  const frontendUrl = getFrontendUrl();
  const email = profile?.emails?.[0]?.value?.toLowerCase();

  if (!email) {
    return res.redirect(`${frontendUrl}/login-success?error=missing_email`);
  }

  const name = profile.displayName || email.split("@")[0];
  const photo = profile?.photos?.[0]?.value || null;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      name,
      passwordHash: `google-oauth:${crypto.randomBytes(24).toString("hex")}`,
      photo,
      profilePicture: photo,
      verificationStatus: { emailVerified: true }
    });
  } else {
    const updates = {};
    if (!user.photo && photo) updates.photo = photo;
    if (!user.profilePicture && photo) updates.profilePicture = photo;
    if (!user.verificationStatus?.emailVerified) {
      updates["verificationStatus.emailVerified"] = true;
    }

    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(
        user._id,
        { $set: updates },
        { returnDocument: "after" }
      );
    }
  }

  const token = signToken({
    userId: user._id,
    role: user.role
  });

  return res.redirect(`${frontendUrl}/login-success?token=${encodeURIComponent(token)}`);
}

router.get(
  "/google",
  requireGoogleOAuth,
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/google/callback", requireGoogleOAuth, (req, res, next) => {
  const frontendUrl = getFrontendUrl();

  passport.authenticate("google", { session: false }, async (err, profile) => {
    if (err) {
      console.error("google auth error:", err.message || err);
      return res.redirect(`${frontendUrl}/login-success?error=google_auth_failed`);
    }

    if (!profile) {
      return res.redirect(`${frontendUrl}/login-success?error=google_auth_failed`);
    }

    try {
      return await finishGoogleLogin(profile, res);
    } catch (saveErr) {
      console.error("google login save error:", saveErr.message || saveErr);
      return res.redirect(`${frontendUrl}/login-success?error=google_auth_failed`);
    }
  })(req, res, next);
});

module.exports = router;
