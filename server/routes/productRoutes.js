const express = require('express');
const router = express.Router();
const { saveProduct, deleteProduct } = require('../controllers/productController');

router.get('/', async (req, res) => {
    const materials = await db.collection('materials').find({ userId: req.user.userId }).toArray();
    const products = await db.collection('products').find({ userId: req.user.userId }).toArray();
    res.render('products.ejs', { materialsData: materials, productsData: products });
});

router.post('/saveProduct', saveProduct);
router.post('/delProduct', deleteProduct);

module.exports = router;
