import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    source: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

QuoteSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
