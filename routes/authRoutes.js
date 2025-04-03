const express = require('express');
const { check } = require('express-validator');
const {
    registerUser,
    verifyUserOTP,
    loginUser,
    registerAdmin,
    verifyAdminOTP,
    loginAdmin,
    getMe,
} = require('../controllers/authController');
const { isAuthenticatedUser, isAuthenticatedAdmin } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('mobile', 'Please include a valid mobile number').not().isEmpty(),
    ],
    registerUser
);

router.post(
    '/verify-otp',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('otp', 'OTP is required').not().isEmpty(),
    ],
    verifyUserOTP
);

router.post(
    '/login',
    [check('email', 'Please include a valid email').isEmail()],
    loginUser
);

// Admin routes
router.post(
    '/admin/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('mobile', 'Please include a valid mobile number').not().isEmpty(),
    ],
    registerAdmin
);

router.post(
    '/admin/verify-otp',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('otp', 'OTP is required').not().isEmpty(),
    ],
    verifyAdminOTP
);

router.post(
    '/admin/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    loginAdmin
);

// Common route
router.get('/me', isAuthenticatedUser, isAuthenticatedAdmin, getMe);

module.exports = router;