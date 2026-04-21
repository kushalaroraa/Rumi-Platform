const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../middleware/authMiddleware");
const SALT_ROUNDS = 10; //controls how strong the hash is -standard is 10

exports.registerUser = async (req, res) => {
    try {
        const {name, email, password, phone} = req.body;
        if (!name?.trim() || name.trim().length < 3) {
          return res.status(400).json({ success: false, message: 'Name is required and must be at least 3 characters.' });
        }
        if (!email?.trim()) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!email.includes("@")) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
        
    // Checking if this email exists
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    } //409- conflict

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name?.trim() || '',
      phone: phone?.trim() || '',
    });

    const token = signToken({ //Generating JWT token
        userId: user._id,
        role: user.role
    });
    const safe = user.toObject();
    delete safe.passwordHash;  //to remove sensitive data
    
    return res.status(201).json({
      success: true,
      message: 'Registered successfully.',
      token,
      user: safe,
    });
  } catch (err) {
    console.error('register error:', err);
    const msg = String(err?.message || '');
    if (msg.includes('before initial connection is complete')) {
      return res.status(503).json({ success: false, message: 'Database is temporarily unavailable. Please try again in a moment.' });
    }
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

exports.loginUser = async (req, res) => {
    try {
    const { email, password } = req.body || {};
    //to prevent empty requests
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    } //401- unauthorized 
    if (!user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken({ //generating JWT token
        userId: user._id,
        role: user.role
    });
    const safe = user.toObject();
    delete safe.passwordHash;

    return res.json({
      success: true,
      token,    //returning token to frontend for future requests
      user: safe,
    });
  } catch (err) {
    console.error('login error:', err);
    const msg = String(err?.message || '');
    if (msg.includes('before initial connection is complete')) {
      return res.status(503).json({ success: false, message: 'Database is temporarily unavailable. Please try again in a moment.' });
    }
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}