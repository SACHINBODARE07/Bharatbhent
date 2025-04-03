const express = require('express');
const {
    getUserProfile,
    updateUserProfile,
    getSavedProducts,
    saveProduct,
    removeSavedProduct,
} = require('../controllers/userController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.get('/me', isAuthenticatedUser, getUserProfile);
router.put('/me', isAuthenticatedUser, updateUserProfile);

// Saved products
router.get('/saved', isAuthenticatedUser, getSavedProducts);
router.post('/saved/:productId', isAuthenticatedUser, saveProduct);
router.delete('/saved/:productId', isAuthenticatedUser, removeSavedProduct);

module.exports = router;