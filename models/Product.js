const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [8, 'Price cannot exceed 8 characters'],
    },
    discountPrice: {
        type: Number,
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    category: {
        type: String,
        required: [true, 'Please enter product category'],
        enum: ['Artefacts', 'Cultural Home Decor', 'Corporate Gifting', 'Gift Card']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [4, 'Stock cannot exceed 4 characters'],
        default: 1,
    },
    dimensions: {
        height: String,
        width: String,
        length: String,
        weight: String,
    },
    material: {
        type: String,
    },
    deliveryTime: {
        type: String,
        default: '6 to 10 days'
    },
    returnPolicy: {
        type: String,
        default: '10 days easy return'
    },
    shippingPolicy: {
        type: String,
        default: 'Order above ₹1000 - All India Free Shipping'
    },
    ratings: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Calculate discount price before saving
productSchema.pre('save', function(next) {
    if (this.discountPercentage > 0) {
        this.discountPrice = this.price - (this.price * this.discountPercentage / 100);
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);