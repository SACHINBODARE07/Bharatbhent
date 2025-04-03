const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../config/jwt');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, mobile } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        // Create user
        user = await User.create({
            name,
            email,
            mobile,
        });

        // Send OTP to email
        await sendOTP(email);

        res.status(201).json({
            success: true,
            message: 'OTP sent to your email',
            data: {
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyUserOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Verify OTP
        await verifyOTP(email, otp);

        // Update user as verified
        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Generate token
        const token = generateToken(user._id, 'user');

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Send OTP to email
        await sendOTP(email);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            data: {
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new admin
// @route   POST /api/v1/auth/admin/register
// @access  Public
exports.registerAdmin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, mobile } = req.body;

        // Check if admin already exists
        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists',
            });
        }

        // Create admin
        admin = await Admin.create({
            name,
            email,
            password,
            mobile,
        });

        // Send OTP to email
        await sendOTP(email);

        res.status(201).json({
            success: true,
            message: 'OTP sent to your email',
            data: {
                email: admin.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and complete admin registration
// @route   POST /api/v1/auth/admin/verify-otp
// @access  Public
exports.verifyAdminOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Verify OTP
        await verifyOTP(email, otp);

        // Update admin as verified
        const admin = await Admin.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found',
            });
        }

        // Generate token
        const token = generateToken(admin._id, 'admin');

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            data: admin,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login admin
// @route   POST /api/v1/auth/admin/login
// @access  Public
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check password
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate token
        const token = generateToken(admin._id, 'admin');

        res.status(200).json({
            success: true,
            token,
            data: admin,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get currently logged in user/admin
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        let user;
        if (req.user) {
            user = await User.findById(req.user._id);
        } else if (req.admin) {
            user = await Admin.findById(req.admin._id);
        } else {
            return res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};