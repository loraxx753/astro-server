import { connectDb } from "../../db.js";
import { User } from "../../models/User.js";
import { signAuthToken } from "./jwt.js";
import type { OAuthProfile } from "./oauth.js";

type StoredUser = {
  _id: unknown;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider: string;
};

function toGraphqlUser(user: StoredUser) {
  return {
    id: String(user._id),
    email: user.email ?? null,
    name: user.name ?? null,
    avatarUrl: user.avatarUrl ?? null,
    provider: user.provider.toUpperCase(),
  };
}

export async function upsertUserFromOAuth(profile: OAuthProfile) {
  await connectDb();
  const user = (await User.findOneAndUpdate(
    { provider: profile.provider, providerId: profile.providerId },
    {
      $set: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
      $setOnInsert: {
        provider: profile.provider,
        providerId: profile.providerId,
      },
    },
    { upsert: true, new: true }
  )) as StoredUser | null;
  if (!user) {
    throw new Error("Could not create the user session.");
  }
  const mapped = toGraphqlUser(user);
  return {
    token: signAuthToken({
      sub: mapped.id,
      email: mapped.email ?? undefined,
      name: mapped.name ?? undefined,
      provider: user.provider,
    }),
    user: mapped,
  };
}

export async function getUserById(id: string) {
  await connectDb();
  const user = (await User.findById(id)) as StoredUser | null;
  return user ? toGraphqlUser(user) : null;
}
