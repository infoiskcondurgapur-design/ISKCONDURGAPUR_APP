import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroomAssessment extends Document {
    batchId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    youtubeUrl?: string;
    dueDate: Date;
    points: number;
    isPinned: boolean;
    status: 'Published' | 'Closed' | 'Draft';
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

const ClassroomAssessmentSchema: Schema = new Schema({
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    youtubeUrl: { type: String },
    dueDate: { type: Date, required: true },
    points: { type: Number, default: 100 },
    isPinned: { type: Boolean, default: false },
    status: { type: String, enum: ['Published', 'Closed', 'Draft'], default: 'Published' },
    category: { type: String, default: 'General' }
}, {
    timestamps: true
});

export default mongoose.models.ClassroomAssessment || mongoose.model<IClassroomAssessment>('ClassroomAssessment', ClassroomAssessmentSchema);
