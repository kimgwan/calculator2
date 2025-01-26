const db = require('../db');

const saveMaterial = async (req, res) => {
    const { materialName, materialType, materialUnit, materialPrice } = req.body;
    const userId = req.user.userId;

    await db.collection('materials').insertOne({
        userId, materialName, materialType, materialUnit, materialPrice
    });

    res.redirect('/materials');
};

const deleteMaterial = async (req, res) => {
    const { materialId } = req.body;
    await db.collection('materials').deleteOne({ _id: new ObjectId(materialId) });
    res.redirect('/materials');
};

module.exports = { saveMaterial, deleteMaterial };
