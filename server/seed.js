import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';

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

    for (const userData of demoUsers) {
      const exists = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (!exists) {
        await User.create(userData);
        console.log(`[Seed] Created ${userData.role}: ${userData.name} (@${userData.username})`);
      } else {
        console.log(`[Seed] User ${userData.username} already exists. Skipping.`);
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
