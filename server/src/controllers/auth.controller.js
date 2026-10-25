import User from '../models/user.model.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

/**
 * Register a new user (Listener or Artist)
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password, role, stageName, genres, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another one.',
      });
    }

    const assignedRole = role === 'artist' ? 'artist' : 'listener';

    const userData = {
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: assignedRole,
      bio: bio || '',
    };

    if (assignedRole === 'artist') {
      userData.artistProfile = {
        stageName: stageName?.trim() || name.trim(),
        genres: Array.isArray(genres) ? genres : (genres ? [genres] : []),
        isVerified: false,
      };
    }

    const newUser = await User.create(userData);

    const token = generateToken(newUser._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: newUser.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, username, loginId, password } = req.body;
    const identifier = (loginId || email || username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email or username and your password.',
      });
    }

    // Find by either email or username with password explicitly selected
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Welcome back to SunteRaho!',
      user: user.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toSafeUser(),
  });
};

/**
 * Log out user & clear cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
