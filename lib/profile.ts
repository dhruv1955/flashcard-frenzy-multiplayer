import { getMongoDb } from './mongodb';

export type UserProfileDoc = {
  userId: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getOrCreateUserProfile(userId: string): Promise<UserProfileDoc> {
  const db = await getMongoDb();
  const now = new Date().toISOString();
  const collection = db.collection<UserProfileDoc>('profiles');
  const existing = await collection.findOne({ userId });
  if (existing) return existing;
  const doc: UserProfileDoc = { userId, createdAt: now, updatedAt: now };
  await collection.insertOne(doc);
  return doc;
}

export async function updateUserProfile(userId: string, updates: Partial<Omit<UserProfileDoc, 'userId' | 'createdAt'>>): Promise<UserProfileDoc> {
  const db = await getMongoDb();
  const collection = db.collection<UserProfileDoc>('profiles');
  const now = new Date().toISOString();
  const result = await collection.findOneAndUpdate(
    { userId },
    { $set: { ...updates, updatedAt: now } },
    { returnDocument: 'after', upsert: true }
  );
  if (!result) throw new Error('Failed to update profile');
  // Some drivers return { value }, others the doc directly when using helper; ensure object shape
  // @ts-ignore - normalize value
  return (result.value ?? result) as UserProfileDoc;
}


