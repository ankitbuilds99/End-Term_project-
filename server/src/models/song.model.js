import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Track title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artist reference is required'],
      index: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      index: true,
    },
    album: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Album name cannot exceed 120 characters'],
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio file URL is required'],
    },
    artworkUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
    },
    duration: {
      type: Number,
      required: [true, 'Track duration in seconds is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    playsCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    audioFileSize: {
      type: Number,
      default: 0,
    },
    audioMimeType: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal queries and sorting
songSchema.index({ isPublished: 1, playsCount: -1 });
songSchema.index({ isPublished: 1, releaseDate: -1 });
songSchema.index({ isPublished: 1, genre: 1, playsCount: -1 });
songSchema.index({ artist: 1, isPublished: 1 });
songSchema.index({ title: 'text', album: 'text' });

const Song = mongoose.model('Song', songSchema);
export default Song;
