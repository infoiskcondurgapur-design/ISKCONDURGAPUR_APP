import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    slug: string;
    content: string;
    summary: string;
    coverImage?: string;
    category: string;
    status: 'Draft' | 'Published';
    author: string;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    coverImage: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', required: true, index: true },
    author: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
