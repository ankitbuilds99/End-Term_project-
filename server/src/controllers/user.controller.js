import User from '../models/user.model.js';
import History from '../models/history.model.js';

/**
 * Get user/artist public profile by ID or username
 * GET /api/users/:identifier
 */
export const getProfile = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: identifier }, { username: identifier.toLowerCase() }] }
      : { username: identifier.toLowerCase() };

    const user = await User.findOne(query).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's profile
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, bio, avatar, artistProfile } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    // If user is an artist and artistProfile is provided, update artist fields
    if (user.role === 'artist' && artistProfile) {
      if (artistProfile.stageName !== undefined) {
        user.artistProfile.stageName = artistProfile.stageName.trim();
      }
      if (artistProfile.banner !== undefined) {
        user.artistProfile.banner = artistProfile.banner.trim();
      }
      if (Array.isArray(artistProfile.genres)) {
        user.artistProfile.genres = artistProfile.genres;
      }
      if (artistProfile.socialLinks) {
        user.artistProfile.socialLinks = {
          ...user.artistProfile.socialLinks,
          ...artistProfile.socialLinks,
        };
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: user.toSafeUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List artists for discovery
 * GET /api/users/artists
 */
export const listArtists = async (req, res, next) => {
  try {
    const { genre, page = 1, limit = 20 } = req.query;
    const filter = { role: 'artist' };

    if (genre) {
      filter['artistProfile.genres'] = { $regex: new RegExp(genre, 'i') };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [artists, total] = await Promise.all([
      User.find(filter)
        .select('name username avatar bio artistProfile createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      artists,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's listening history (Private to owner)
 * GET /api/users/me/history
 */
export const getListeningHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [historyItems, total] = await Promise.all([
      History.find({ user: userId })
        .populate({
          path: 'song',
          populate: { path: 'artist', select: 'name username avatar artistProfile' },
        })
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      History.countDocuments({ user: userId }),
    ]);

    // Filter out deleted songs if any
    const validHistory = historyItems.filter((item) => item.song != null);

    return res.status(200).json({
      success: true,
      history: validHistory,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear current user's listening history
 * DELETE /api/users/me/history
 */
export const clearListeningHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await History.deleteMany({ user: userId });
    return res.status(200).json({
      success: true,
      message: 'Listening history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};
