const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");
const Waitlist = require("../models/waitlist");

// --- Helpers ---
const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "2h" }
  );
};

// --- Controllers ---

const testRoute = (req, res) => {
  res.json({ success: true, message: "Auth router is working!" });
};

const verifyCredentials = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!email || !phone || !name) {
      return res
        .status(400)
        .json({ success: false, error: "Name, email and phone are required." });
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid phone number format." });
    }

    const waitlistUser = await Waitlist.findOne({ email });
    if (!waitlistUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email not found in waitlist." });
    }
    if (waitlistUser.phone !== phone) {
      return res
        .status(400)
        .json({ success: false, error: "Phone number does not match." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.json({
        success: true,
        isNewUser: false,
        message: "Account already exists. Please login instead.",
      });
    }

    res.json({
      success: true,
      isNewUser: true,
      message:
        "Credentials verified from waitlist. Please complete your profile.",
      waitlistData: {
        name: waitlistUser.name,
        email: waitlistUser.email,
        phone: waitlistUser.phone,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, phone, name, password } = req.body;
    if (!email || !phone || !name || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Email, phone, name and password are required.",
        });
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid phone number format." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Password must be at least 8 characters long.",
        });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "Email or phone already in use." });
    }

    const user = new User({
      email,
      phone,
      name,
      password,
      userType: "student",
      isVerified: true,
      lastActivity: new Date(),
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Please verify your email before logging in.",
        });
    }

    user.lastActivity = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        lastActivity: user.lastActivity,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

const refreshSession = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    user.lastActivity = new Date();
    await user.save();

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      token: newToken,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        lastActivity: user.lastActivity,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const completeProfile = async (req, res) => {
  try {
    const { surname, educationLevel, userType, isStudent, email, phone } =
      req.body;

    const user = await User.findOne({ email, phone });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    if (surname) user.surname = surname;
    if (educationLevel) user.educationLevel = educationLevel;
    if (userType) user.userType = userType;
    if (typeof isStudent === "boolean") user.isStudent = isStudent;

    user.lastActivity = new Date();
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-verificationToken");
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    user.lastActivity = new Date();
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const oauthCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("http://localhost:5173/login?error=oauth_failed");
    }

    await User.findByIdAndUpdate(req.user._id, { lastActivity: new Date() });
    const token = generateToken(req.user._id);

    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  } catch (err) {
    res.redirect("http://localhost:5173/login?error=oauth_failed");
  }
};

const validateToken = (req, res) => {
  res.json({ valid: true, user: { userId: req.userId } });
};

module.exports = {
  testRoute,
  verifyCredentials,
  signup,
  login,
  logout,
  refreshSession,
  completeProfile,
  me,
  oauthCallback,
  validateToken,
};
