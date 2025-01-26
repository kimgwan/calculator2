const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productName: { type: String, required: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    unitPrice: Number
});

module.exports = mongoose.model('Product', productSchema);
