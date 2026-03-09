const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        description: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: ['sweaters', 'shirts', 'shoes', 'accessories', 'jackets', 'trousers'],
            index: true,
        },
        gender: { type: String, enum: ['men', 'women', 'children', 'unisex'], default: 'unisex', index: true },
        price: { type: Number, required: true, min: 0 },
        discountPct: { type: Number, default: 0, min: 0, max: 100 },
        colors: [{ type: String }],
        sizes: [{ type: String }],
        images: [{ type: String }],
        stock: { type: Number, default: 100, min: 0 },
        featured: { type: Boolean, default: false },
        rating: { type: Number, default: 4.0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Virtual: discounted price
productSchema.virtual('salePrice').get(function () {
    return +(this.price * (1 - this.discountPct / 100)).toFixed(2);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
