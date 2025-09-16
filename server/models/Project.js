const mongoose = require('mongoose');
const { Schema } = mongoose;

// Project Schema
// Represents a carbon project under an organization
const ProjectSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    organization: { 
        type: Schema.Types.ObjectId, 
        ref: 'Organization', 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    projectArea: { 
        type: Number, 
        required: true 
    }, // e.g., hectares
    baselineData: { 
        type: Schema.Types.Mixed 
    }, // baseline ecological / carbon data
    status: { 
        type: String, 
        enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'], 
        default: 'DRAFT' 
    },
}, { timestamps: true });

ProjectSchema.index({ organization: 1, status: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
