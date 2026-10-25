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
        name: 'Prateek Kuhad',
        username: 'prateekkuhad',
        email: 'prateek@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
        bio: 'Singer-songwriter strumming quiet tunes, indie acoustic ballads, and nostalgic stories.',
        artistProfile: {
          stageName: 'Prateek Kuhad',
          genres: ['Indie Pop', 'Folk & Acoustic'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/prateekkuhad',
            youtube: 'https://youtube.com/@prateekkuhad',
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
        name: 'Demo Listener',
        username: 'listener',
        email: 'listener@sunteraho.com',
        password: 'password123',
        role: 'listener',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        bio: 'Music addict, playlist explorer, and late-night Lo-Fi listener.',
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

    // Seed Authorized Audio Tracks
    const demoSongs = [
      {
        title: 'Shayad (Soulful Acoustic Reprise)',
        artist: userMap['arijitsingh']._id,
        genre: 'Bollywood',
        album: 'Acoustic Memories',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        duration: 372,
        playsCount: 1420,
        isPublished: true,
      },
      {
        title: 'Tum Hi Ho (Midnight Piano Session)',
        artist: userMap['arijitsingh']._id,
        genre: 'Bollywood',
        album: 'Aashiqui Sessions',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
        duration: 423,
        playsCount: 2840,
        isPublished: true,
      },
      {
        title: 'Cold / Mess (Heartbreak Sunset)',
        artist: userMap['prateekkuhad']._id,
        genre: 'Indie Pop',
        album: 'Cold / Mess EP',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        duration: 345,
        playsCount: 3120,
        isPublished: true,
      },
      {
        title: 'Kasoor (Gentle Breeze)',
        artist: userMap['prateekkuhad']._id,
        genre: 'Folk & Acoustic',
        album: 'Kasoor Single',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
        duration: 302,
        playsCount: 1890,
        isPublished: true,
      },
      {
        title: 'Udd Gaye (Future Bass Drop)',
        artist: userMap['ritviz']._id,
        genre: 'Electronic / EDM',
        album: 'Bacardi Sessions',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        duration: 391,
        playsCount: 4560,
        isPublished: true,
      },
      {
        title: 'Liggi (Festive Synth Beats)',
        artist: userMap['ritviz']._id,
        genre: 'Electronic / EDM',
        album: 'Yuv EP',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
        duration: 334,
        playsCount: 2210,
        isPublished: true,
      },
      {
        title: 'Unreleased Studio Demo (Draft)',
        artist: userMap['arijitsingh']._id,
        genre: 'Acoustic',
        album: 'Private Demos',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        duration: 180,
        playsCount: 0,
        isPublished: false, // Unpublished track for testing publication visibility
      },
    ];

    for (const songData of demoSongs) {
      const exists = await Song.findOne({
        title: songData.title,
        artist: songData.artist,
      });

      if (!exists) {
        await Song.create(songData);
        console.log(`[Seed] Created song: "${songData.title}" (${songData.genre})`);
      } else {
        console.log(`[Seed] Song "${songData.title}" already exists.`);
      }
    }

    console.log('[Seed] Seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDemoData();
