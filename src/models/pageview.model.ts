import mongoose, { Schema, Document } from 'mongoose';

export interface IPageView extends Document {
    path: string;
    sessionId: string;
    ip: string;
    userAgent: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    browserName: string;
    referrer: string;
    city: string;
    country: string;
    createdAt: Date;
}

const PageViewSchema: Schema = new Schema({
    path: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'], default: 'desktop' },
    browserName: { type: String, default: 'Other' },
    referrer: { type: String, default: 'direct' },
    city: { type: String, default: 'Unknown' },
    country: { type: String, default: 'Unknown' },
    createdAt: { type: Schema.Types.Date, default: Date.now, index: true }
});

// Avoid re-compiling the model in development (Next.js HMR)
export default mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema);
