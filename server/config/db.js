import mongoose from 'mongoose';

let isConnected = false;
let connectionError = null;

export const isMongoDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (mongoUri && typeof mongoUri === 'string') {
    mongoUri = mongoUri.trim().replace(/^['"]|['"]$/g, '');
  }

  if (mongoUri && mongoUri.length > 0) {
    try {
      // Disconnect any existing stale connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });

      isConnected = true;
      connectionError = null;
      console.log(`[MongoDB] Atlas Connected successfully: Host=${conn.connection.host}, DB=${conn.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Runtime Connection Error:', err.message);
        isConnected = false;
        connectionError = err.message;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected from Atlas. Attempting to reconnect.');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('[MongoDB] Reconnected to Atlas successfully.');
        isConnected = true;
        connectionError = null;
      });

      return conn;
    } catch (error) {
      isConnected = false;
      connectionError = error.message;
      console.error(`[MongoDB] Atlas connection error: ${error.message}`);
    }
  } else {
    console.log('[MongoDB] Note: MONGO_URI environment variable is currently empty or not provided.');
  }

  return null;
};

export const getDBStatus = () => {
  const online = isConnected && mongoose.connection.readyState === 1;
  return {
    connected: online,
    type: online ? 'MongoDB Atlas (Live Connected)' : 'MongoDB (Waiting for MONGO_URI)',
    readyState: mongoose.connection.readyState,
    databaseName: online ? mongoose.connection.name : 'edupulse',
    error: connectionError,
    uriConfigured: Boolean(process.env.MONGO_URI && process.env.MONGO_URI.trim().length > 0),
    timestamp: new Date().toISOString(),
  };
};
