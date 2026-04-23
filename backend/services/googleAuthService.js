const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || 'rumi-jwt-secret-change-in-production';
const SALT_ROUNDS = 10;

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

function getBackendBaseUrl() {
  return cleanEnvValue(process.env.BACKEND_URL) || `http://localhost:${process.env.PORT || 9090}`;
}

function getFrontendBaseUrl() {
  return cleanEnvValue(process.env.FRONTEND_URL) || 'http://localhost:5173';
}

function getGoogleCallbackUrl() {
  return cleanEnvValue(process.env.GOOGLE_CALLBACK_URL) || `${getBackendBaseUrl()}/api/auth/google/callback`;
}

function buildGoogleAuthUrl(state) {
  const clientId = cleanEnvValue(process.env.GOOGLE_CLIENT_ID);
  const callbackUrl = getGoogleCallbackUrl();

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function createGoogleState() {
  return jwt.sign(
    { provider: 'google', nonce: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: '10m' }
  );
}

async function exchangeGoogleCode(code) {
  const clientId = cleanEnvValue(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET);
  const callbackUrl = getGoogleCallbackUrl();

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured.');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code'
    }).toString()
  });

  if (!tokenResponse.ok) {
    const details = await tokenResponse.text();
    throw new Error(`Google token exchange failed: ${details || tokenResponse.statusText}`);
  }

  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  if (!profileResponse.ok) {
    const details = await profileResponse.text();
    throw new Error(`Google profile fetch failed: ${details || profileResponse.statusText}`);
  }

  return profileResponse.json();
}

async function upsertGoogleUser(googleProfile) {
  const email = cleanEnvValue(googleProfile?.email).toLowerCase();
  if (!email) {
    throw new Error('Google login did not return an email address.');
  }

  const fallbackName = email.split('@')[0] || 'Google User';
  const safeName = cleanEnvValue(googleProfile?.name) || fallbackName;
  const picture = cleanEnvValue(googleProfile?.picture) || null;
  const googleId = cleanEnvValue(googleProfile?.sub || googleProfile?.id);

  let user = await User.findOne({ email });

  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS);
    user = await User.create({
      email,
      passwordHash,
      name: safeName,
      phone: '',
      authProvider: 'google',
      googleId,
      googlePicture: picture,
      profilePicture: picture,
      verificationStatus: {
        emailVerified: true,
        phoneVerified: false,
        aadharVerified: false
      }
    });
  } else {
    if (googleId && !user.googleId) {
      user.googleId = googleId;
    }
    if (picture && !user.googlePicture) {
      user.googlePicture = picture;
    }
    if (picture && !user.profilePicture) {
      user.profilePicture = picture;
    }
    if (!user.name || user.name === user.email) {
      user.name = safeName;
    }
    if (user.verificationStatus && user.verificationStatus.emailVerified !== true) {
      user.verificationStatus.emailVerified = true;
    }
    await user.save();
  }

  return user;
}

function redirectWithGoogleResult(res, params) {
  const redirectUrl = new URL('/login-success', getFrontendBaseUrl());
  redirectUrl.searchParams.set('auth', 'google');
  if (params?.token) redirectUrl.searchParams.set('token', params.token);
  if (params?.error) redirectUrl.searchParams.set('error', params.error);
  return res.redirect(302, redirectUrl.toString());
}

module.exports = {
  createGoogleState,
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  upsertGoogleUser,
  redirectWithGoogleResult
};
