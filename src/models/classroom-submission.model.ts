import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroomSubmission extends Document {
    assessmentId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    textSubmission?: string;
    audioUrl?: string;
    fileUrl?: string;
    fileName?: string;
    status: 'Submitted' | 'Not Submitted';
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ClassroomSubmissionSchema: Schema = new Schema({
    assessmentId: { type: Schema.Types.ObjectId, ref: 'ClassroomAssessment', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    textSubmission: { type: String },
    audioUrl: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    status: { type: String, enum: ['Submitted', 'Not Submitted'], default: 'Submitted' },
    submittedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.models.ClassroomSubmission || mongoose.model<IClassroomSubmission>('ClassroomSubmission', ClassroomSubmissionSchema);
