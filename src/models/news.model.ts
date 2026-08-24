import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
    title: string;
    content: string;
    author: string;
    category: string;
    status: 'Draft' | 'Published';
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NewsSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Temple Admin' },
    category: { type: String, default: 'Announcements' },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    date: { type: Date, required: true, index: true }
}, {
    timestamps: true
});

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
