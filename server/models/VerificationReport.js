const mongoose = require('mongoose');
const { Schema } = mongoose;

// Verification Report Schema
// Produced by a verifier after reviewing monitoring data
const VerificationReportSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true // retained for frequent report queries per project
    },
    monitoringStartPeriod: {
        type: Date,
        required: true
    },
    monitoringEndPeriod: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    verifier: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true  
        //removing the user need, currently
    },
    verificationTxHash: {
        type: String
    },
    verifiedCarbonAmount: {
        type: Number,
        min: 0
    }, // e.g., tonnes CO2e
    notes: {
        type: String,
    },
}, { timestamps: true });

VerificationReportSchema.index({ project: 1, monitoringStartPeriod: 1, monitoringEndPeriod: 1 });

module.exports = mongoose.model('VerificationReport', VerificationReportSchema);