import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_EXPIRES = "7d";

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is required");
    err.statusCode = 500;
    throw err;
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: JWT_EXPIRES });
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase();
}

function createCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}

function setAuthCookies(res, token) {
  const csrfToken = createCsrfToken();

  res.cookie("safeglow_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure:
      String(process.env.COOKIE_SECURE || "").toLowerCase() === "true" ||
      String(process.env.NODE_ENV).toLowerCase() === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure:
      String(process.env.COOKIE_SECURE || "").toLowerCase() === "true" ||
      String(process.env.NODE_ENV).toLowerCase() === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return csrfToken;
}

export const register = async (req, res, next) => {
  try {
    const { username, name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      const err = new Error("Email already in use");
      err.statusCode = 409;
      throw err;
    }

    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      const err = new Error("Username already in use");
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const requireEmailVerification =
      String(process.env.EMAIL_VERIFICATION_REQUIRED || "").toLowerCase() ===
      "true";

    let emailVerified = true;
    let emailVerificationTokenHash;
    let emailVerificationExpiresAt;

    if (requireEmailVerification) {
      emailVerified = false;
      const rawToken = crypto.randomBytes(32).toString("hex");
      emailVerificationTokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      emailVerificationExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const verifyUrl = `${process.env.PUBLIC_API_BASE_URL || ""}/api/auth/verify-email?token=${rawToken}`;
      console.log("Email verification link:", verifyUrl);
    }

    const user = await User.create({
      username: normalizedUsername,
      name,
      email: normalizedEmail,
      password: hashed,
      emailVerified,
      emailVerificationTokenHash,
      emailVerificationExpiresAt,
    });

    let token = null;
    let csrfToken = null;

    if (!requireEmailVerification) {
      token = signToken(user._id);
      csrfToken = setAuthCookies(res, token);
    }

    res.status(201).json({
      message: requireEmailVerification
        ? "Verification email sent"
        : "Registered",
      token,
      csrfToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const err = new Error("Account not found. Please register first.");
      err.statusCode = 404;
      throw err;
    }

    const requireEmailVerification =
      String(process.env.EMAIL_VERIFICATION_REQUIRED || "").toLowerCase() ===
      "true";

    if (requireEmailVerification && user.emailVerified !== true) {
      const err = new Error("Email verification required");
      err.statusCode = 403;
      throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const token = signToken(user._id);
    const csrfToken = setAuthCookies(res, token);

    res.json({
      message: "Logged in",
      token,
      csrfToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const exists = async (req, res, next) => {
  try {
    const email = req.query?.email;
    const username = req.query?.username;

    let user = null;
    if (email) {
      user = await User.findOne({ email: normalizeEmail(email) });
    } else if (username) {
      user = await User.findOne({ username: normalizeUsername(username) });
    }

    res.json({ exists: Boolean(user) });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = String(req.query?.token || "");
    if (!token) {
      const err = new Error("token is required");
      err.statusCode = 400;
      throw err;
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      const err = new Error("Invalid or expired token");
      err.statusCode = 400;
      throw err;
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    res.json({ message: "Email verified" });
  } catch (err) {
    next(err);
  }
};
