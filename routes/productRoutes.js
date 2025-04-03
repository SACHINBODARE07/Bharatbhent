const express = require('express');
const {
    getProducts,
    getProduct,
    getProductsByCategory,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/category/:category', getProductsByCategory);

module.exports = router;