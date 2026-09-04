import mongoose from "mongoose";

let connecting: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error(
      "MONGO_URL is not set. Create a MongoDB Atlas cluster and add the URL to astro-server/.env (see docs/oauth-setup.md)."
    );
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (!connecting) {
    connecting = mongoose.connect(uri);
  }
  return connecting;
}
