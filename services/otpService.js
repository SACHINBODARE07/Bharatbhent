const OTP = require('../models/OTP');
const sendEmail = require('./emailService');

exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = async (email) => {
    try {
        // Generate OTP
        const otp = exports.generateOTP();

        // Save OTP to database
        await OTP.create({ email, otp });

        // Send OTP to email
        const message = `Your OTP for Bharath Bhent verification is ${otp}. This OTP is valid for 5 minutes.`;
        await sendEmail({
            email,
            subject: 'Bharath Bhent - OTP Verification',
            message,
        });

        return otp;
    } catch (error) {
        throw new Error('Error sending OTP');
    }
};

exports.verifyOTP = async (email, otp) => {
    try {
        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            throw new Error('Invalid OTP');
        }

        // Delete the OTP after verification
        await OTP.deleteOne({ _id: otpRecord._id });

        return true;
    } catch (error) {
        throw new Error('Error verifying OTP');
    }
};