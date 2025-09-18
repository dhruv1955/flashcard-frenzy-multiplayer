import { MongoClient } from 'mongodb';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

let cachedClient: MongoClient | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (cachedClient) return cachedClient;
  const uri = getEnv('MONGODB_URI');
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${(error as Error).message}`);
  }
};

export const getMongoDb = async (dbName = process.env.MONGODB_DB ?? 'flashcard_frenzy') => {
  const client = await getMongoClient();
  return client.db(dbName);
};


