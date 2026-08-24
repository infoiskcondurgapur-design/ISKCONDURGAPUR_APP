import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyUpdate extends Document {
    date: string; // Format: YYYY-MM-DD
    title: string;
    message: string;
    images?: string[];
    youtubeVideoId?: string;
    status: 'Draft' | 'Published';
    createdAt: Date;
    updatedAt: Date;
}

const DailyUpdateSchema: Schema = new Schema({
    date: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    images: { type: [String], default: [] },
    youtubeVideoId: { type: String },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published', index: true }
}, {
    timestamps: true
});

export default mongoose.models.DailyUpdate || mongoose.model<IDailyUpdate>('DailyUpdate', DailyUpdateSchema);
