import mongoose, { Schema, Document } from 'mongoose';

export interface IFormResponse extends Document {
  formId: mongoose.Types.ObjectId;
  answers: Record<string, any>; // maps field 'name' to the submitted value/file-link
  status: 'Pending' | 'Reviewed';
  createdAt: Date;
  updatedAt: Date;
}

const FormResponseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: { type: Map, of: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.models.FormResponse || mongoose.model<IFormResponse>('FormResponse', FormResponseSchema);
