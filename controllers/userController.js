const Product = require('../models/Product');

// @desc    Get user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get saved products
// @route   GET /api/v1/users/saved
// @access  Private
exports.getSavedProducts = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('savedProducts');

        res.status(200).json({
            success: true,
            data: user.savedProducts,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save product
// @route   POST /api/v1/users/saved/:productId
// @access  Private
exports.saveProduct = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        // Check if product is already saved
        if (user.savedProducts.includes(req.params.productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product already saved',
            });
        }

        user.savedProducts.push(req.params.productId);
        await user.save();

        res.status(200).json({
            success: true,
            data: user.savedProducts,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove saved product
// @route   DELETE /api/v1/users/saved/:productId
// @access  Private
exports.removeSavedProduct = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        // Check if product is saved
        if (!user.savedProducts.includes(req.params.productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product not saved',
            });
        }

        user.savedProducts = user.savedProducts.filter(
            (id) => id.toString() !== req.params.productId
        );
        await user.save();

        res.status(200).json({
            success: true,
            data: user.savedProducts,
        });
    } catch (error) {
        next(error);
    }
};