import mongoose, { Schema, Document } from 'mongoose';

export interface IFormField {
  name: string;      // slugified field identifier (e.g. 'full_name')
  label: string;     // display label (e.g. 'Full Name')
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'file' | 'checkbox';
  required: boolean;
  options?: string[]; // for select dropdowns
}

export interface IForm extends Document {
  title: string;
  slug: string;       // unique slug for public URL (e.g., 'idc-exam')
  description?: string;
  fields: IFormField[];
  isActive: boolean;
  opensAt?: Date;     // Scheduled opening date/time
  closesAt?: Date;    // Scheduled closing date/time
  syncToGoogleDrive: boolean;
  googleDriveFolderId?: string; // Optional folder to save uploaded files
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'email', 'textarea', 'select', 'file', 'checkbox'], required: true },
  required: { type: Boolean, default: false },
  options: [{ type: String }]
});

const FormSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  fields: [FormFieldSchema],
  isActive: { type: Boolean, default: true },
  opensAt: { type: Date },
  closesAt: { type: Date },
  syncToGoogleDrive: { type: Boolean, default: false },
  googleDriveFolderId: { type: String }
}, { timestamps: true });

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
