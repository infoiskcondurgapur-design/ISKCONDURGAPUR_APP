import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteStats extends Document {
    key: string;
    totalVisitors: number;
}

const SiteStatsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    totalVisitors: { type: Number, default: 0 },
});

// Avoid re-compiling the model in development (Next.js HMR)
export default mongoose.models.SiteStats || mongoose.model<ISiteStats>('SiteStats', SiteStatsSchema);
