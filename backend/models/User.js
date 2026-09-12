const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    mobile: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    kycStatus: { 
        type: String, 
        enum: ['pending_upload', 'under_review', 'verified', 'rejected'], 
        default: 'pending_upload' 
    },
    bankDetails: {
        accountNumber: String,
        ifsc: String,
        bankName: String
    },
    kycVideoUrl: String
    // ❌ balances removed – we now use the Wallet model
});

module.exports = mongoose.model('User', UserSchema);