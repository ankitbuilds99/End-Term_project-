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
    console.log('[Seed] Connected successfully.');

    const demoUsers = [
      {
        name: 'Imagine Dragons',
        username: 'imaginedragons',
        email: 'imaginedragons@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/imagine_dragons.jpg',
        bio: 'Grammy Award-winning American pop rock band from Las Vegas, Nevada, known for world-famous stadium anthems like Believer and Radioactive.',
        artistProfile: {
          stageName: 'Imagine Dragons',
          genres: ['Alternative Rock', 'Pop Rock', 'Indie Rock'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/imaginedragons',
            twitter: 'https://twitter.com/imaginedragons',
            youtube: 'https://youtube.com/@imaginedragons',
          },
        },
      },
      {
        name: 'Billie Eilish',
        username: 'billieeilish',
        email: 'billie@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/billie_eilish.jpg',
        bio: 'Grammy and Academy Award-winning American singer and songwriter known for dark pop, whisper vocals, and global chart-toppers like bad guy.',
        artistProfile: {
          stageName: 'Billie Eilish',
          genres: ['Dark Pop', 'Alternative Pop', 'Electropop'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/billieeilish',
            youtube: 'https://youtube.com/@BillieEilish',
          },
        },
      },
      {
        name: 'Djo (Joe Keery)',
        username: 'djo_music',
        email: 'djo@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/djo.jpg',
        bio: 'Actor and musician Joe Keery crafting hypnotic psychedelic pop, retro synth-wave, and the viral anthem End of Beginning.',
        artistProfile: {
          stageName: 'Djo',
          genres: ['Synth-pop', 'Psychedelic Pop', 'Indie Rock'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/djotime',
            youtube: 'https://youtube.com/@djo',
          },
        },
      },
      {
        name: 'Alex Warren',
        username: 'alexwarren',
        email: 'alex@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/alex_warren.jpg',
        bio: 'American singer-songwriter celebrated for emotional acoustic ballads, heartfelt lyrics, and viral hits like Ordinary.',
        artistProfile: {
          stageName: 'Alex Warren',
          genres: ['Pop', 'Acoustic', 'Folk Pop'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/alexwarren',
            youtube: 'https://youtube.com/@AlexWarren',
          },
        },
      },
      {
        name: 'Arijit Singh',
        username: 'arijitsingh',
        email: 'arijit@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/arijit_singh.jpg',
        bio: 'The voice of modern Indian cinema, globally celebrated for soulful romantic melodies, acoustic ballads, and timeless vocals.',
        artistProfile: {
          stageName: 'Arijit Singh',
          genres: ['Bollywood', 'Sufi', 'Acoustic'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/arijitsingh',
            youtube: 'https://youtube.com/@arijitsinghofficial',
          },
        },
      },
      {
        name: 'Shreya Ghoshal',
        username: 'shreyaghoshal',
        email: 'shreya@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/shreya_ghoshal.jpg',
        bio: 'Five-time National Film Award winner and one of Indian music history’s most versatile, legendary playback vocalists.',
        artistProfile: {
          stageName: 'Shreya Ghoshal',
          genres: ['Bollywood', 'Classical', 'Pop'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/shreyaghoshal',
            youtube: 'https://youtube.com/@shreyaghoshal',
          },
        },
      },
      {
        name: 'Atif Aslam',
        username: 'atifaslam',
        email: 'atif@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/atif_aslam.jpg',
        bio: 'Iconic South Asian rock & playback vocalist renowned for raw emotional belts, timeless romance, and sufi rock anthems.',
        artistProfile: {
          stageName: 'Atif Aslam',
          genres: ['Bollywood', 'Sufi Rock', 'Pop'],
          isVerified: true,
          socialLinks: {
            instagram: 'https://instagram.com/atifaslam',
            youtube: 'https://youtube.com/@AtifAslamOfficial',
          },
        },
      },
      {
        name: 'KK (Krishnakumar Kunnath)',
        username: 'kk_music',
        email: 'kk@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/kk.jpg',
        bio: 'Legendary Indian playback singer whose timeless romantic and nostalgic anthems defined an entire generation.',
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
        name: 'Mohit Chauhan',
        username: 'mohitchauhan',
        email: 'mohit@sunteraho.com',
        password: 'password123',
        role: 'artist',
        avatar: '/uploads/artists/mohit_chauhan.jpg',
        bio: 'Soulful Indian singer-songwriter celebrated for Silk Route, rustic acoustic vocals, and unforgettable Bollywood classics.',
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
        avatar: '/uploads/artists/ritviz.jpg',
        bio: 'Pioneering electronic dance music producer blending classical Indian melodies with infectious future bass drops.',
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
        // Update avatar, bio, and artistProfile with authentic information
        user.avatar = userData.avatar;
        user.bio = userData.bio;
        user.name = userData.name;
        if (userData.artistProfile) {
          user.artistProfile = userData.artistProfile;
        }
        await user.save();
        console.log(`[Seed] Updated profile and avatar for ${userData.username}`);
      }
      userMap[userData.username] = user;
    }

    // Clear existing songs to replace with the clean catalogue of original tracks with genuine photo covers
    await Song.deleteMany({});
    console.log('[Seed] Cleared existing song catalogue.');

    const realSongs = [
      {
        title: 'Believer',
        artist: userMap['imaginedragons']._id,
        genre: 'Alternative Rock',
        album: 'Evolve',
        audioUrl: '/uploads/audio/believer.mp3',
        artworkUrl: '/uploads/artwork/believer.jpg',
        duration: 204,
        playsCount: 421000,
        isPublished: true,
      },
      {
        title: 'End of Beginning',
        artist: userMap['djo_music']._id,
        genre: 'Synth-pop',
        album: 'Decide',
        audioUrl: '/uploads/audio/end_of_beginning.mp3',
        artworkUrl: '/uploads/artwork/end_of_beginning.png',
        duration: 159,
        playsCount: 389000,
        isPublished: true,
      },
      {
        title: 'Ordinary',
        artist: userMap['alexwarren']._id,
        genre: 'Pop',
        album: 'Ordinary - Single',
        audioUrl: '/uploads/audio/ordinary.mp3',
        artworkUrl: '/uploads/artwork/ordinary.png',
        duration: 187,
        playsCount: 275000,
        isPublished: true,
      },
      {
        title: 'bad guy',
        artist: userMap['billieeilish']._id,
        genre: 'Dark Pop',
        album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
        audioUrl: '/uploads/audio/bad_guy.mp3',
        artworkUrl: '/uploads/artwork/bad_guy.png',
        duration: 194,
        playsCount: 512000,
        isPublished: true,
      },
      {
        title: 'Tum Hi Ho',
        artist: userMap['arijitsingh']._id,
        genre: 'Bollywood',
        album: 'Aashiqui 2',
        audioUrl: '/uploads/audio/tum_hi_ho.mp3',
        artworkUrl: '/uploads/artwork/aashiqui_2.jpeg',
        duration: 264,
        playsCount: 345000,
        isPublished: true,
      },
      {
        title: 'Chikni Chameli',
        artist: userMap['shreyaghoshal']._id,
        genre: 'Bollywood',
        album: 'Agneepath',
        audioUrl: '/uploads/audio/chikni_chameli.mp3',
        artworkUrl: '/uploads/artwork/agneepath.jpg',
        duration: 303,
        playsCount: 298000,
        isPublished: true,
      },
      {
        title: 'Tu Jaane Na',
        artist: userMap['atifaslam']._id,
        genre: 'Bollywood',
        album: 'Ajab Prem Ki Ghazab Kahani',
        audioUrl: '/uploads/audio/tu_jaane_na.mp3',
        artworkUrl: '/uploads/artwork/ajab_prem.jpg',
        duration: 341,
        playsCount: 312000,
        isPublished: true,
      },
      {
        title: 'Abhi Kuch Dino Se',
        artist: userMap['mohitchauhan']._id,
        genre: 'Indie Pop',
        album: 'Dil Toh Baccha Hai Ji',
        audioUrl: '/uploads/audio/abhi_kuch_dino_se.mp3',
        artworkUrl: '/uploads/artwork/dil_toh_baccha.jpg',
        duration: 285,
        playsCount: 198000,
        isPublished: true,
      },
      {
        title: 'Abhi Abhi',
        artist: userMap['kk_music']._id,
        genre: 'Bollywood',
        album: 'Jism 2',
        audioUrl: '/uploads/audio/abhi_abhi.mp3',
        artworkUrl: '/uploads/artwork/jism_2.jpg',
        duration: 345,
        playsCount: 221000,
        isPublished: true,
      },
      {
        title: 'Mat Aazma Re',
        artist: userMap['kk_music']._id,
        genre: 'Bollywood',
        album: 'Murder 3',
        audioUrl: '/uploads/audio/mat_aazma_re.mp3',
        artworkUrl: '/uploads/artwork/murder_3.jpg',
        duration: 271,
        playsCount: 185000,
        isPublished: true,
      },
      {
        title: 'Tu Mohabbat Hai',
        artist: userMap['atifaslam']._id,
        genre: 'Bollywood',
        album: 'Tere Naal Love Ho Gaya',
        audioUrl: '/uploads/audio/tu_mohabbat_hai.mp3',
        artworkUrl: '/uploads/artwork/tere_naal.jpg',
        duration: 337,
        playsCount: 176000,
        isPublished: true,
      },
      {
        title: 'Chammak Challo',
        artist: userMap['ritviz']._id,
        genre: 'Electronic / EDM',
        album: 'Ra.One',
        audioUrl: '/uploads/audio/chammak_challo.mp3',
        artworkUrl: '/uploads/artwork/ra_one.jpg',
        duration: 226,
        playsCount: 341000,
        isPublished: true,
      },
      {
        title: 'Unreleased Acoustic Studio Demo',
        artist: userMap['arijitsingh']._id,
        genre: 'Acoustic',
        album: 'Studio Drafts',
        audioUrl: '/uploads/audio/tum_hi_ho.mp3',
        artworkUrl: '/uploads/artwork/aashiqui_2.jpeg',
        duration: 264,
        playsCount: 0,
        isPublished: false, // Private draft to test artist draft isolation
      },
    ];

    for (const songData of realSongs) {
      await Song.create(songData);
      console.log(`[Seed] Created Track: "${songData.title}" by ${songData.album} [${songData.artworkUrl}]`);
    }

    console.log('[Seed] Seeding completed successfully with 10 Artists and 12 Original Songs!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDemoData();
