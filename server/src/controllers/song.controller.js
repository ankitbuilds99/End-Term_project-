import Song from '../models/song.model.js';
import User from '../models/user.model.js';
import { cleanupUploadedFiles, deleteLocalMedia, getAudioDuration } from '../utils/upload.js';

// Cache to prevent arbitrary client-side play event spamming and duplicate counts
// Format: "songId:sessionId/IP" -> timestamp
const playEventCooldown = new Map();
const PLAY_COOLDOWN_MS = 60 * 1000; // 60 seconds deduplication window

// Periodic cleanup of cooldown cache
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of playEventCooldown.entries()) {
    if (now - timestamp > PLAY_COOLDOWN_MS) {
      playEventCooldown.delete(key);
    }
  }
}, 5 * 60 * 1000);
cleanupTimer.unref();

/**
 * Public Catalogue: Browse and search published songs
 * GET /api/songs
 */
export const getSongs = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      artistId,
      sort = 'popular',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isPublished: true };

    if (genre && genre !== 'All') {
      filter.genre = { $regex: new RegExp(`^${genre.trim()}$`, 'i') };
    }

    if (artistId) {
      filter.artist = artistId;
    }

    // Keyword search across title, album, and artist name
    if (search && search.trim()) {
      const q = search.trim();
      // Find matching artists first to include in search
      const matchingArtists = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
          { 'artistProfile.stageName': { $regex: q, $options: 'i' } },
        ],
      }).select('_id');

      const artistIds = matchingArtists.map((a) => a._id);

      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
        ...(artistIds.length > 0 ? [{ artist: { $in: artistIds } }] : []),
      ];
    }

    // Sort strategy
    let sortOptions = { playsCount: -1, releaseDate: -1 };
    if (sort === 'latest') {
      sortOptions = { releaseDate: -1, _id: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { releaseDate: 1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [songs, total] = await Promise.all([
      Song.find(filter)
        .populate('artist', 'name username avatar artistProfile')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Song.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      songs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get track details by ID
 * GET /api/songs/:id
 */
export const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid track ID format',
      });
    }

    const song = await Song.findById(id).populate('artist', 'name username avatar artistProfile');
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Track not found',
      });
    }

    // Enforce publication visibility: unpublished tracks can ONLY be viewed by owner or admin
    if (!song.isPublished) {
      const isOwner = req.user && (song.artist._id.equals(req.user._id) || req.user.role === 'admin');
      if (!isOwner) {
        return res.status(404).json({
          success: false,
          message: 'Track not found or is currently private.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      song,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create/Upload a new track (Artist only)
 * POST /api/songs
 */
export const createSong = async (req, res, next) => {
  try {
    const { title, genre, album, duration, isPublished } = req.body;

    if (!title || !title.trim()) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Track title is required.',
      });
    }

    if (!genre || !genre.trim()) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Track genre is required.',
      });
    }

    const audioFile = req.files?.['audio']?.[0];
    const artworkFile = req.files?.['artwork']?.[0];

    let audioUrl = req.body.audioUrl;
    let artworkUrl = req.body.artworkUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80';
    let trackDuration = duration ? Math.round(Number(duration)) : null;

    if (audioFile) {
      audioUrl = `/uploads/audio/${audioFile.filename}`;
      // Calculate duration from audio file metadata if not provided by client
      if (!trackDuration) {
        const detectedDuration = await getAudioDuration(audioFile.path);
        if (detectedDuration) {
          trackDuration = detectedDuration;
        }
      }
    }

    if (artworkFile) {
      artworkUrl = `/uploads/artwork/${artworkFile.filename}`;
    }

    if (!audioUrl) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Audio file or audio URL is required.',
      });
    }

    if (!trackDuration || trackDuration <= 0) {
      // Default to 180 seconds if duration couldn't be parsed
      trackDuration = 180;
    }

    const song = await Song.create({
      title: title.trim(),
      artist: req.user._id,
      genre: genre.trim(),
      album: album?.trim() || '',
      audioUrl,
      artworkUrl,
      duration: trackDuration,
      isPublished: isPublished === undefined ? true : (isPublished === 'true' || isPublished === true),
      audioFileSize: audioFile?.size || 0,
      audioMimeType: audioFile?.mimetype || 'audio/mpeg',
    });

    const populatedSong = await Song.findById(song._id).populate('artist', 'name username avatar artistProfile');

    return res.status(201).json({
      success: true,
      message: 'Track uploaded and published successfully!',
      song: populatedSong,
    });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    next(error);
  }
};

/**
 * Update track metadata / publication status (Artist owner only)
 * PUT /api/songs/:id
 */
export const updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, genre, album, isPublished } = req.body;

    const song = await Song.findById(id);
    if (!song) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    // Verify ownership
    if (!song.artist.equals(req.user._id) && req.user.role !== 'admin') {
      cleanupUploadedFiles(req.files);
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to edit this track.',
      });
    }

    if (title !== undefined) song.title = title.trim();
    if (genre !== undefined) song.genre = genre.trim();
    if (album !== undefined) song.album = album.trim();
    if (isPublished !== undefined) {
      song.isPublished = isPublished === 'true' || isPublished === true;
    }

    const artworkFile = req.files?.['artwork']?.[0];
    if (artworkFile) {
      // Remove old local artwork file if replacing
      deleteLocalMedia(song.artworkUrl);
      song.artworkUrl = `/uploads/artwork/${artworkFile.filename}`;
    } else if (req.body.artworkUrl) {
      song.artworkUrl = req.body.artworkUrl;
    }

    await song.save();

    const updatedSong = await Song.findById(song._id).populate('artist', 'name username avatar artistProfile');

    return res.status(200).json({
      success: true,
      message: 'Track updated successfully!',
      song: updatedSong,
    });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    next(error);
  }
};

/**
 * Delete a track (Artist owner only)
 * DELETE /api/songs/:id
 */
export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    // Verify ownership
    if (!song.artist.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this track.',
      });
    }

    // Delete associated media files on disk
    deleteLocalMedia(song.audioUrl);
    deleteLocalMedia(song.artworkUrl);

    await Song.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Track permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tracks by the current authenticated artist (published & unpublished)
 * GET /api/songs/artist/my-tracks
 */
export const getMyTracks = async (req, res, next) => {
  try {
    const songs = await Song.find({ artist: req.user._id })
      .sort({ createdAt: -1 });

    const totalPlays = songs.reduce((sum, s) => sum + (s.playsCount || 0), 0);
    const publishedCount = songs.filter((s) => s.isPublished).length;

    return res.status(200).json({
      success: true,
      songs,
      stats: {
        totalTracks: songs.length,
        publishedCount,
        unpublishedCount: songs.length - publishedCount,
        totalPlays,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validated Listening Play Event
 * POST /api/songs/:id/play
 * Enforces listening threshold rule (30 seconds or 50% of track length) and deduplicates
 */
export const recordPlayEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { listenDuration, sessionId } = req.body;

    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    const durationPlayed = Number(listenDuration) || 0;
    // Listening threshold: at least 30 seconds OR 50% of total duration for short tracks
    const requiredThreshold = Math.min(30, Math.max(5, Math.floor(song.duration * 0.5)));

    if (durationPlayed < requiredThreshold) {
      return res.status(400).json({
        success: false,
        message: `Listening threshold not met. Played ${durationPlayed}s, but minimum threshold is ${requiredThreshold}s.`,
      });
    }

    // Cooldown check per session/user/IP
    const identifier = req.user?._id?.toString() || sessionId || req.ip || 'anonymous';
    const cooldownKey = `${song._id.toString()}:${identifier}`;
    const lastPlayedAt = playEventCooldown.get(cooldownKey);
    const now = Date.now();

    if (lastPlayedAt && now - lastPlayedAt < PLAY_COOLDOWN_MS) {
      return res.status(200).json({
        success: true,
        message: 'Play already counted recently for this session.',
        playsCount: song.playsCount,
        cooldown: true,
      });
    }

    // Increment play count atomically
    playEventCooldown.set(cooldownKey, now);
    const updatedSong = await Song.findByIdAndUpdate(
      id,
      { $inc: { playsCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Validated play recorded.',
      playsCount: updatedSong.playsCount,
    });
  } catch (error) {
    next(error);
  }
};
