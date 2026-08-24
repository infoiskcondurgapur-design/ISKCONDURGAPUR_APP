import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String, required: true },
    image: { type: String },
    status: { type: String, enum: ['Active', 'Planning', 'Completed'], default: 'Active' },
    targetAmount: { type: Number },
    raisedAmount: { type: Number, default: 0 },
    donorsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProjectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
