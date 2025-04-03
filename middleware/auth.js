const jwt = require('jsonwebtoken');
const { verifyToken } = require('../config/jwt');
const Admin = require('../models/Admin');
const User = require('../models/User');

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource',
            });
        }

        const decoded = verifyToken(token);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

exports.isAuthenticatedAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource',
            });
        }

        const decoded = verifyToken(token);
        req.admin = await Admin.findById(decoded.id);

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};


exports.protect = exports.isAuthenticatedUser; // Alias for consistency
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }
        
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Role: ${req.admin.role} is not allowed to access this resource`,
            });
        }
        next();
    };
};


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Role: ${req.admin.role} is not allowed to access this resource`,
            });
        }
        next();
    };
};