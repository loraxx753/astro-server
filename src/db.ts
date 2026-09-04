import mongoose from "mongoose";

let connecting: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Create a MongoDB Atlas cluster and add the URI to astro-server/.env (see docs/oauth-setup.md)."
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
