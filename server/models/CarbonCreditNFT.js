const mongoose = require('mongoose');
const { Schema } = mongoose;

// Carbon Credit NFT Schema
// Represents tokenized verified carbon credits
const CarbonCreditNFTSchema = new Schema({
    tokenId: { 
        type: String, 
        required: true
    },
    contractAddress: { 
        type: String, 
        required: true
    },
    project: { 
        type: Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true, 
        index: true // retained for frequent project-based lookups
    },
    verificationReport: { 
        type: Schema.Types.ObjectId, 
        ref: 'VerificationReport', 
        required: true 
    },
    mintTxHash: { 
        type: String, 
        required: true 
    },
    currentOwnerWallet: { 
        type: String, 
        required: true, 
    },
    status: { 
        type: String, 
        enum: ['MINTED', 'TRANSFERRED', 'RETIRED'], 
        default: 'MINTED', 
    },
}, { timestamps: true });

CarbonCreditNFTSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true });

module.exports = mongoose.model('CarbonCreditNFT', CarbonCreditNFTSchema);
