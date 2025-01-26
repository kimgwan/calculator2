const express = require('express');
const router = express.Router();
const { saveMaterial, deleteMaterial } = require('../controllers/materialController');

router.get('/', async (req, res) => {
    const materials = await db.collection('materials').find({ userId: req.user.userId }).toArray();
    res.render('materials.ejs', { data: materials });
});

router.post('/save', saveMaterial);
router.post('/m-delete', deleteMaterial);

module.exports = router;
