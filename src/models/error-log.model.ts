import mongoose, { Schema, Document } from 'mongoose';

export interface IErrorLog extends Document {
    message: string;
    name: string;
    statusCode: number;
    path?: string;
    stack?: string;
    createdAt: Date;
}

const ErrorLogSchema: Schema = new Schema({
    message: { type: String, required: true },
    name: { type: String, default: 'Error' },
    statusCode: { type: Number, default: 500 },
    path: { type: String },
    stack: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.models.ErrorLog || mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema);
