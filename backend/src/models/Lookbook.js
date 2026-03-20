const mongoose = require('mongoose');

const lookbookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String },
        coverImage: { type: String, required: true },
        season: { type: String },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        tags: [{ type: String }],
        featured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Lookbook', lookbookSchema);
