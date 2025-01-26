const db = require('../db');

const saveProduct = async (req, res) => {
    const { productName, materialId, unitPrice } = req.body;
    const userId = req.user.userId;

    await db.collection('products').insertOne({
        userId, productName, materialId, unitPrice
    });

    res.redirect('/products');
};

const deleteProduct = async (req, res) => {
    const { productId } = req.body;
    await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
    res.redirect('/products');
};

module.exports = { saveProduct, deleteProduct };
