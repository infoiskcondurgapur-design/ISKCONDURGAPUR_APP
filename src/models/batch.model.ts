import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    enrolledStudents: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const BatchSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);
