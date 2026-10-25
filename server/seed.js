import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';
import Song from './src/models/song.model.js';

dotenv.config();

const rawUri = process.env.db_url || process.env.dbURL || process.env.MONGO_URI;
let uri = rawUri?.trim();
if (uri && uri.includes('.mongodb.net/') && !uri.includes('.mongodb.net/sunteraho')) {
  uri = uri.replace('.mongodb.net/', '.mongodb.net/sunteraho?retryWrites=true&w=majority');
}

const seedDemoData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected.');

    const demoUsers = [
      {
        name: 'Arijit Singh',
        username: 'arijitsingh',
        email: 'arijit@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
        bio: 'Playback singer and composer creating soulful melodies, acoustic memories, and romantic tracks.',
        artistProfile: {
          stageName: 'Arijit Singh',
          genres: ['Bollywood', 'Sufi', 'Acoustic'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/arijitsingh',
            twitter: 'https://twitter.com/arijitsingh',
            youtube: 'https://youtube.com/@arijitsinghofficial',
          },
        },
      },
      {
        name: 'Mohit Chauhan',
        username: 'mohitchauhan',
        email: 'mohit@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
        bio: 'Iconic Indian singer-songwriter celebrated for soulful melodies and Silk Route rock acoustic vibes.',
        artistProfile: {
          stageName: 'Mohit Chauhan',
          genres: ['Indie Pop', 'Folk & Acoustic', 'Bollywood'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/mohitchauhan',
            youtube: 'https://youtube.com/@mohitchauhan',
          },
        },
      },
      {
        name: 'Ritviz Srivastava',
        username: 'ritviz',
        email: 'ritviz@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80',
        bio: 'Electronic dance producer fusing classical Indian melodies with infectious electronic drops.',
        artistProfile: {
          stageName: 'Ritviz',
          genres: ['Electronic / EDM', 'Indie Pop'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/ritviz',
            youtube: 'https://youtube.com/@ritviz',
          },
        },
      },
      {
        name: 'KK (Krishnakumar Kunnath)',
        username: 'kk_music',
        email: 'kk@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80',
        bio: 'Legendary Indian playback singer known for timeless romantic anthems and unforgettable melodies.',
        artistProfile: {
          stageName: 'KK',
          genres: ['Bollywood', 'Rock', 'Sufi'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/kk_singer',
          },
        },
      },
      {
        name: 'Demo Listener',
        username: 'listener',
        email: 'listener@sunteraho.com',
        password: 'password123',
        role: 'listener',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        bio: 'Music addict, playlist explorer, and late-night listener.',
      },
    ];

    const userMap = {};

    for (const userData of demoUsers) {
      let user = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (!user) {
        user = await User.create(userData);
        console.log(`[Seed] Created ${userData.role}: ${userData.name} (@${userData.username})`);
      } else {
        console.log(`[Seed] User ${userData.username} already exists.`);
      }
      userMap[userData.username] = user;
    }

    // Clear previous generic mock tracks and seed real songs with real vocal tracks
    await Song.deleteMany({
      title: {
        $in: [
          'Tum Hi Ho (Original)',
          'Chammak Challo',
          'Abhi Kuch Dino Se',
          'Abhi Abhi (Soul Ballad)',
          'Tu Mohabbat Hai (Club Mix)',
          'Shayad (Soulful Acoustic Reprise)',
          'Tum Hi Ho (Midnight Piano Session)',
          'Cold / Mess (Heartbreak Sunset)',
          'Kasoor (Gentle Breeze)',
          'Udd Gaye (Future Bass Drop)',
          'Liggi (Festive Synth Beats)',
          'Unreleased Studio Demo (Draft)',
        ],
      },
    });

    const realSongs = [
      {
        title: 'Tum Hi Ho',
        artist: userMap['arijitsingh']._id,
        genre: 'Bollywood',
        album: 'Aashiqui 2',
        audioUrl: '/uploads/audio/tum_hi_ho.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
        duration: 264,
        playsCount: 28450,
        isPublished: true,
      },
      {
        title: 'Chammak Challo',
        artist: userMap['ritviz']._id,
        genre: 'Electronic / EDM',
        album: 'Ra.One Soundtrack',
        audioUrl: '/uploads/audio/chammak_challo.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        duration: 226,
        playsCount: 34120,
        isPublished: true,
      },
      {
        title: 'Abhi Kuch Dino Se',
        artist: userMap['mohitchauhan']._id,
        genre: 'Indie Pop',
        album: 'Dil Toh Baccha Hai Ji',
        audioUrl: '/uploads/audio/abhi_kuch_dino_se.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        duration: 285,
        playsCount: 19800,
        isPublished: true,
      },
      {
        title: 'Abhi Abhi',
        artist: userMap['kk_music']._id,
        genre: 'Bollywood',
        album: 'Jism 2',
        audioUrl: '/uploads/audio/abhi_abhi.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
        duration: 345,
        playsCount: 22100,
        isPublished: true,
      },
      {
        title: 'Tu Mohabbat Hai (Club Mix)',
        artist: userMap['ritviz']._id,
        genre: 'Electronic / EDM',
        album: 'Club Hits Edition',
        audioUrl: '/uploads/audio/tu_mohabbat_hai.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        duration: 393,
        playsCount: 15400,
        isPublished: true,
      },
      {
        title: 'Arijit Singh Unreleased Demo (Private)',
        artist: userMap['arijitsingh']._id,
        genre: 'Bollywood',
        album: 'Studio Drafts',
        audioUrl: '/uploads/audio/tum_hi_ho.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        duration: 264,
        playsCount: 0,
        isPublished: false, // Private draft to test draft visibility
      },
    ];

    for (const songData of realSongs) {
      await Song.create(songData);
      console.log(`[Seed] Created Real Track: "${songData.title}" (${songData.genre})`);
    }

    console.log('[Seed] Seeding completed with REAL tracks successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDemoData();
