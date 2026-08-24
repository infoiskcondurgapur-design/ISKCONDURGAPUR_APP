import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
    name: string;
    email: string;
    phone: string;
    type: 'Contact' | 'Membership' | 'Volunteer' | 'Donation' | 'PujaBooking';
    message: string;
    status: 'Pending' | 'Reviewed';
    createdAt: Date;
    updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, enum: ['Contact', 'Membership', 'Volunteer', 'Donation', 'PujaBooking'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' }
}, {
    timestamps: true
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
