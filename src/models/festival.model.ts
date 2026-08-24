import mongoose, { Schema, Document } from 'mongoose';

export interface IFestival extends Document {
    name: string;
    date: Date;
    timing: string;
    status: 'Active' | 'Upcoming' | 'Inactive';
    createdAt: Date;
    updatedAt: Date;
}

const FestivalSchema: Schema = new Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    timing: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Upcoming', 'Inactive'], default: 'Upcoming' }
}, {
    timestamps: true
});

export default mongoose.models.Festival || mongoose.model<IFestival>('Festival', FestivalSchema);
