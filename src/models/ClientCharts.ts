// import mongoose, { Schema, Document } from 'mongoose';
// export interface IClientChart extends Document {
//   name: string;
//   birthDate: string;
//   birthTime: string;
//   birthLocation: {
//     city?: string;
//     country?: string;
//     state?: string;
//     latitude: number;
//     longitude: number;
//     timezone?: string;
//   };
//   chartData: any;
//   createdAt: string;
// }
// const ClientChartSchema = new Schema({
//   name: { type: String, required: true },
//   birthDate: { type: String, required: true },
//   birthTime: { type: String, required: true },
//   birthLocation: {
//     city: String,
//     country: String,
//     state: String,
//     latitude: Number,
//     longitude: Number,
//     timezone: String,
//   },
//   chartData: Schema.Types.Mixed,
//   createdAt: { type: String, required: true },
// });
// export const ClientCharts = mongoose.model('ClientCharts', ClientChartSchema);
