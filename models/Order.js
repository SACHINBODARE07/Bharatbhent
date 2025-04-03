const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        },
        pinCode: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        id: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        method: {
            type: String,
            enum: ['COD', 'Card', 'UPI', 'NetBanking'],
            required: true
        }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    promoCode: {
        type: String
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Processing'
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate shipping price based on order amount
orderSchema.pre('save', async function(next) {
    if (this.itemsPrice >= 1000) {
        this.shippingPrice = 0; // Free shipping for orders over ₹1000
    } else {
        this.shippingPrice = 100; // Default shipping charge
    }
    
    // Apply 10% discount if promo code is RAM10
    if (this.promoCode === 'RAM10') {
        this.discount = this.itemsPrice * 0.1;
    }
    
    this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice - this.discount;
    next();
});

module.exports = mongoose.model('Order', orderSchema);