import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const rawUri = process.env.db_url || process.env.dbURL || process.env.MONGO_URI;
    if (!rawUri) {
      throw new Error('MongoDB connection URI (db_url) is not defined in environment variables');
    }

    let uri = rawUri.trim();
    // Ensure the database name 'sunteraho' is appended if missing in MongoDB Atlas SRV URI
    if (uri.includes('.mongodb.net/') && !uri.includes('.mongodb.net/sunteraho')) {
      uri = uri.replace('.mongodb.net/', '.mongodb.net/sunteraho?retryWrites=true&w=majority');
    }

    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
