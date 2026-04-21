const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const hasGoogleOAuthConfig =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 9090}`;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`;

if (hasGoogleOAuthConfig) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackUrl
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
  ));
} else {
  console.warn(
    "[env] Google OAuth is disabled. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it."
  );
}

passport.isGoogleOAuthConfigured = hasGoogleOAuthConfig;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
