import mongoose, { Schema } from "mongoose";

export type AuthProviderName = "google" | "github";

export interface UserDocument {
  id: string;
  provider: AuthProviderName;
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

const UserSchema = new Schema(
  {
    provider: { type: String, enum: ["google", "github"], required: true },
    providerId: { type: String, required: true },
    email: String,
    name: String,
    avatarUrl: String,
  },
  { timestamps: true }
);

UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
