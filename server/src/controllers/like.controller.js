import Like from '../models/like.model.js';
import Song from '../models/song.model.js';

/**
 * Toggle like/unlike for a song
 * POST /api/songs/:id/like
 */
export const toggleLike = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: songId } = req.params;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found.',
      });
    }

    const existingLike = await Like.findOne({
      user: userId,
      song: songId,
    });

    let isLiked = false;

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      isLiked = false;
    } else {
      try {
        await Like.create({
          user: userId,
          song: songId,
        });
        isLiked = true;
      } catch (err) {
        if (err.code === 11000) {
          isLiked = true;
        } else {
          throw err;
        }
      }
    }

    const likesCount = await Like.countDocuments({ song: songId });

    return res.status(200).json({
      success: true,
      isLiked,
      likesCount,
      message: isLiked ? 'Added to your Liked Songs' : 'Removed from your Liked Songs',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all liked songs for the authenticated user
 * GET /api/songs/user/liked
 */
export const getLikedSongs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [likes, total] = await Promise.all([
      Like.find({ user: userId })
        .populate({
          path: 'song',
          match: { isPublished: true },
          populate: {
            path: 'artist',
            select: 'name username avatar artistProfile',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Like.countDocuments({ user: userId }),
    ]);

    // Extract valid populated songs
    const songs = likes
      .map((l) => l.song)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      songs,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get IDs of all songs liked by current user (for fast heart icons)
 * GET /api/songs/user/liked-ids
 */
export const getLikedSongIds = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const likes = await Like.find({ user: userId }).select('song');
    const songIds = likes.map((l) => l.song.toString());

    return res.status(200).json({
      success: true,
      songIds,
    });
  } catch (error) {
    next(error);
  }
};
