import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage extends Document {
    url: string;
    title?: string;
    date: Date;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GalleryImageSchema: Schema = new Schema({
    url: { type: String, required: true },
    title: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
    category: { type: String, default: 'General' }
}, {
    timestamps: true
});

export default mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
