const mongoose = require('mongoose');

// Organization Schema
// Represents NGOs or Panchayats that must be approved before creating projects
const OrganizationSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    type: { 
        type: String, 
        enum: ['NGO', 'PANCHAYAT'], 
        required: true 
    },
    // walletAddress: { 
    //     type: String, 
    //     required: true, 
    //     index: true 
    // },
    status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING' 
    },
}, { timestamps: true });

OrganizationSchema.index({ name: 1, type: 1 }, { unique: false });

module.exports = mongoose.model('Organization', OrganizationSchema);
