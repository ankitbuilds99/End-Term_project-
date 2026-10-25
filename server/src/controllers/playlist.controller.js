import Playlist from '../models/playlist.model.js';
import Song from '../models/song.model.js';

/**
 * Create a new playlist
 * POST /api/playlists
 */
export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, coverUrl, isPublic } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Playlist title is required.',
      });
    }

    const playlist = await Playlist.create({
      title: title.trim(),
      description: description?.trim() || '',
      coverUrl: coverUrl?.trim() || undefined,
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      owner: req.user._id,
      songs: [],
    });

    const populated = await Playlist.findById(playlist._id).populate('owner', 'name username avatar');

    return res.status(201).json({
      success: true,
      message: 'Playlist created successfully!',
      playlist: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public playlists for browsing and discovery
 * GET /api/playlists
 */
export const getPlaylists = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const filter = { isPublic: true };

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [playlists, total] = await Promise.all([
      Playlist.find(filter)
        .populate('owner', 'name username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Playlist.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      playlists,
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
 * Get playlists owned by authenticated user
 * GET /api/playlists/my-playlists
 */
export const getMyPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate('owner', 'name username avatar')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      playlists,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get playlist details with ordered tracks
 * GET /api/playlists/:id
 */
export const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid playlist ID format.',
      });
    }

    const playlist = await Playlist.findById(id)
      .populate('owner', 'name username avatar')
      .populate({
        path: 'songs',
        populate: {
          path: 'artist',
          select: 'name username avatar artistProfile',
        },
      });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    // Privacy access check: Private playlists are only visible to owner or admin
    if (!playlist.isPublic) {
      const isOwner = req.user && (playlist.owner._id.equals(req.user._id) || req.user.role === 'admin');
      if (!isOwner) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found or is private.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update playlist metadata (Owner only)
 * PUT /api/playlists/:id
 */
export const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, coverUrl, isPublic } = req.body;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    // Verify ownership
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this playlist.',
      });
    }

    if (title !== undefined) playlist.title = title.trim();
    if (description !== undefined) playlist.description = description.trim();
    if (coverUrl !== undefined) playlist.coverUrl = coverUrl.trim();
    if (isPublic !== undefined) playlist.isPublic = Boolean(isPublic);

    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('owner', 'name username avatar')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name username avatar artistProfile' },
      });

    return res.status(200).json({
      success: true,
      message: 'Playlist updated successfully!',
      playlist: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a playlist (Owner only)
 * DELETE /api/playlists/:id
 */
export const deletePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    // Verify ownership
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this playlist.',
      });
    }

    await Playlist.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Playlist permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add song to playlist (Owner only)
 * POST /api/playlists/:id/songs
 */
export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    // Verify ownership
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this playlist.',
      });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found.',
      });
    }

    // Check if song already exists in playlist to avoid redundant duplicates
    const alreadyExists = playlist.songs.some((s) => s.toString() === songId.toString());
    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: 'This track is already in the playlist.',
      });
    }

    playlist.songs.push(songId);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('owner', 'name username avatar')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name username avatar artistProfile' },
      });

    return res.status(200).json({
      success: true,
      message: `"${song.title}" added to playlist!`,
      playlist: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove song from playlist (Owner only)
 * DELETE /api/playlists/:id/songs/:songId
 */
export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { id, songId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    // Verify ownership
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this playlist.',
      });
    }

    playlist.songs = playlist.songs.filter((s) => s.toString() !== songId.toString());
    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('owner', 'name username avatar')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name username avatar artistProfile' },
      });

    return res.status(200).json({
      success: true,
      message: 'Track removed from playlist.',
      playlist: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder tracks in playlist (Owner only)
 * PUT /api/playlists/:id/reorder
 */
export const reorderPlaylistTracks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body;

    if (!Array.isArray(songIds)) {
      return res.status(400).json({
        success: false,
        message: 'songIds must be an array of ordered song IDs.',
      });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    // Verify ownership
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this playlist.',
      });
    }

    playlist.songs = songIds;
    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('owner', 'name username avatar')
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'name username avatar artistProfile' },
      });

    return res.status(200).json({
      success: true,
      message: 'Track order updated.',
      playlist: updated,
    });
  } catch (error) {
    next(error);
  }
};
