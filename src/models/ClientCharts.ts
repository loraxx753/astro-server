import mongoose, { Schema, Document } from 'mongoose';

export interface IClientChart extends Document {
  name: string;
  birthDate: string;
  birthTime: string;
  location: {
    city?: string;
    country?: string;
    state?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  chartData: any;
  createdAt: Date;
}

const ClientChartSchema = new Schema({
  name: { type: String, required: true },
  birthDate: { type: String, required: true },
  birthTime: { type: String, required: true },
  location: {
    city: String,
    country: String,
    state: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
  },
  chartData: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ClientCharts = mongoose.model('ClientCharts', ClientChartSchema);
