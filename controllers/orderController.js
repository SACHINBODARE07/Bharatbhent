const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { shippingInfo, paymentInfo, promoCode } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
        return next(new ErrorResponse('No items in cart', 400));
    }
    
    // Prepare order items
    const items = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price
    }));
    
    // Calculate items price
    const itemsPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Create order
    const order = await Order.create({
        user: req.user._id,
        items,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice: itemsPrice * 0.18, // 18% GST
        promoCode,
        shippingPrice: itemsPrice >= 1000 ? 0 : 100 // Free shipping for orders over ₹1000
    });
    
    // Update product stock
    await Promise.all(cart.items.map(async item => {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity }
        });
    }));
    
    // Clear cart
    await Cart.findByIdAndDelete(cart._id);
    
    res.status(201).json({
        success: true,
        data: order
    });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price images');
    
    if (!order) {
        return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to access this order`, 401));
    }
    
    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/me
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name price images');
    
    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get all orders - Admin
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price');
    
    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Update order status - Admin
// @route   PUT /api/v1/orders/:id
// @access  Private/Admin
exports.updateOrder = asyncHandler(async (req, res, next) => {
    const { orderStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
        return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    
    if (orderStatus === 'Delivered') {
        order.deliveredAt = Date.now();
    }
    
    order.orderStatus = orderStatus;
    await order.save();
    
    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Delete order - Admin
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
        return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }
    
    await order.remove();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});