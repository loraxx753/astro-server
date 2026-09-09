import mongoose, { Schema } from "mongoose";

export type ClientChartLocation = {
  city?: string;
  country?: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type ClientChartDocument = {
  _id: unknown;
  userId: string;
  name: string;
  birthDate: string;
  birthTime: string;
  location: ClientChartLocation;
  houseSystem?: string;
  gender?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const ClientChartSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    birthDate: { type: String, required: true },
    birthTime: { type: String, required: true },
    location: {
      city: String,
      country: String,
      state: String,
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      timezone: String,
    },
    houseSystem: { type: String, default: "placidus" },
    gender: String,
    notes: String,
  },
  { timestamps: true, id: false }
);

ClientChartSchema.index({ userId: 1, createdAt: -1 });

ClientChartSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const ClientCharts =
  mongoose.models.ClientCharts ||
  mongoose.model("ClientCharts", ClientChartSchema);

let indexesReady: Promise<void> | null = null;

function isIndexMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 27
  );
}

export async function ensureClientChartIndexes(): Promise<void> {
  if (!indexesReady) {
    indexesReady = (async () => {
      try {
        await ClientCharts.collection.dropIndex("id_1");
      } catch (error) {
        if (!isIndexMissing(error)) {
          throw error;
        }
      }
      await ClientCharts.updateMany(
        { $or: [{ id: null }, { id: { $exists: true } }] },
        { $unset: { id: 1 } }
      );
      await ClientCharts.syncIndexes();
    })();
  }
  return indexesReady;
}
