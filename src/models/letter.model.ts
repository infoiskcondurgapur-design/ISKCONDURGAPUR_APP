import mongoose, { Schema, Document } from 'mongoose';

export interface ILetter extends Document {
    title: string;
    recipient: string;
    date: string;
    location: string;
    category: string;
    body: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const LetterSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true, index: true },
        recipient: { type: String, required: true, trim: true },
        date: { type: String, required: true, trim: true },
        location: { type: String, default: '', trim: true },
        category: {
            type: String,
            default: 'General',
            trim: true,
            index: true,
        },
        body: { type: String, required: true },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

// Text index for full-text search across all key fields
LetterSchema.index({ title: 'text', recipient: 'text', body: 'text', category: 'text' });

export default mongoose.models.Letter || mongoose.model<ILetter>('Letter', LetterSchema);
