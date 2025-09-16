const mongoose = require('mongoose');
const { Schema } = mongoose;

// User Schema
// Represents platform users tied to an organization with roles
const UserSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    passwordHash: { 
        type: String, 
        required: true 
    }, // store bcrypt hash
    organization: { 
        type: Schema.Types.ObjectId, 
        ref: 'Organization', 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['ADMIN', 'FIELD_AGENT', 'VERIFIER'], 
        required: true 
    },
    walletAddress: { 
        type: String, 
        required: true 
    },
    active: { 
        type: Boolean, 
        default: true 
    },
}, { timestamps: true });

UserSchema.index({ organization: 1, role: 1 });

module.exports = mongoose.model('User', UserSchema);
