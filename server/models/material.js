const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    materialName: { type: String, required: true },
    materialType: String,
    materialUnit: String,
    materialPrice: Number
});

module.exports = mongoose.model('Material', materialSchema);
