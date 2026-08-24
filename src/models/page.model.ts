import mongoose, { Schema, Document } from 'mongoose';

export interface IPage extends Document {
    title: string;
    slug: string;
    content: string;
    author: string;
    status: 'Draft' | 'Published';
    createdAt: Date;
    updatedAt: Date;
}

const PageSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Temple Admin' },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' }
}, {
    timestamps: true
});

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
