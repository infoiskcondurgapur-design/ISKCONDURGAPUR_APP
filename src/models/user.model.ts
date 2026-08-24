import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    fullName?: string;
    password: string;
    role: 'admin' | 'devotee' | 'user';
    email?: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    isVerified?: boolean;
    verifyToken?: string;
    verifyTokenExpiry?: Date;
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, index: true },
    fullName: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'devotee', 'user'], default: 'user' },
    email: { type: String, sparse: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    isVerified: { type: Boolean },
    verifyToken: { type: String },
    verifyTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    lastLogin: { type: Date },
}, {
    timestamps: true
});

// Avoid re-compiling the model in development (Next.js HMR)
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
