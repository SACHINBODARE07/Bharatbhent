const express = require('express');
const {
    getAllUsers,
    getUser,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/adminController');
const { isAuthenticatedAdmin } = require('../middleware/auth');

const router = express.Router();

// User management
router.get('/users', isAuthenticatedAdmin, getAllUsers);
router.get('/users/:id', isAuthenticatedAdmin, getUser);

// Product management
router.post('/products', isAuthenticatedAdmin, createProduct);
router.put('/products/:id', isAuthenticatedAdmin, updateProduct);
router.delete('/products/:id', isAuthenticatedAdmin, deleteProduct);

module.exports = router;