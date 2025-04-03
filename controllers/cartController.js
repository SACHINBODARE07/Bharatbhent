const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
        return res.status(200).json({
            success: true,
            data: { items: [] }
        });
    }
    
    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;
    
    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }
    
    if (product.stock < quantity) {
        return next(new ErrorResponse(`Not enough stock available`, 400));
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
        // Update quantity if product already in cart
        cart.items[itemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    
    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ErrorResponse(`Cart not found`, 404));
    }
    
    const itemIndex = cart.items.findIndex(
        item => item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
        return next(new ErrorResponse(`Item not found in cart`, 404));
    }
    
    // Check product stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.stock < quantity) {
        return next(new ErrorResponse(`Not enough stock available`, 400));
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        return next(new ErrorResponse(`Cart not found`, 404));
    }
    
    const itemIndex = cart.items.findIndex(
        item => item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
        return next(new ErrorResponse(`Item not found in cart`, 404));
    }
    
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    
    res.status(200).json({
        success: true,
        data: { items: [] }
    });
});