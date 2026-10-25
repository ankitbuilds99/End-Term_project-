import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';

/**
 * Toggle follow/unfollow an artist
 * POST /api/users/:artistId/follow
 */
export const toggleFollow = async (req, res, next) => {
  try {
    const followerId = req.user._id;
    const { artistId } = req.params;

    if (followerId.toString() === artistId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.',
      });
    }

    const artistUser = await User.findById(artistId);
    if (!artistUser) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found.',
      });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      artist: artistId,
    });

    let isFollowing = false;

    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      isFollowing = false;
    } else {
      try {
        await Follow.create({
          follower: followerId,
          artist: artistId,
        });
        isFollowing = true;
      } catch (err) {
        // Handle race-condition duplicate key error gracefully
        if (err.code === 11000) {
          isFollowing = true;
        } else {
          throw err;
        }
      }
    }

    const followerCount = await Follow.countDocuments({ artist: artistId });

    return res.status(200).json({
      success: true,
      isFollowing,
      followerCount,
      message: isFollowing
        ? `You are now following ${artistUser.artistProfile?.stageName || artistUser.name}`
        : `Unfollowed ${artistUser.artistProfile?.stageName || artistUser.name}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if the authenticated user follows an artist
 * GET /api/users/:artistId/is-following
 */
export const getFollowStatus = async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const followerId = req.user?._id;

    const [isFollowing, followerCount] = await Promise.all([
      followerId ? Follow.exists({ follower: followerId, artist: artistId }) : null,
      Follow.countDocuments({ artist: artistId }),
    ]);

    return res.status(200).json({
      success: true,
      isFollowing: Boolean(isFollowing),
      followerCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of artists followed by currently authenticated user
 * GET /api/users/me/following
 */
export const getMyFollowedArtists = async (req, res, next) => {
  try {
    const followerId = req.user._id;

    const follows = await Follow.find({ follower: followerId })
      .populate('artist', 'name username avatar bio artistProfile createdAt')
      .sort({ createdAt: -1 });

    const artists = follows
      .map((f) => f.artist)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      artists,
      count: artists.length,
    });
  } catch (error) {
    next(error);
  }
};
