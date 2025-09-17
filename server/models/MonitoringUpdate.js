const mongoose = require('mongoose');
const { Schema } = mongoose;

// Monitoring Update Schema
// Field agent submissions with evidence stored via IPFS
const MonitoringUpdateSchema = new Schema({
    project: { 
        type: Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true, 
        index: true // retained for filtering updates by project
    },
    submittedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now
    },
    evidenceType: { 
        type: String, 
        enum: ['GEOTAGGED_PHOTO', 'DRONE_FOOTAGE', 'SATELLITE', 'OTHER'], 
        required: true 
    },
    ipfsHash: { 
        type: String, 
        default:'NULL'
    },
    filePath:{
        type:String,
        required:true
    },
    dataPayload: { 
        type: Schema.Types.Mixed 
    }, // details like species planted, counts, notes
}, { timestamps: true });

MonitoringUpdateSchema.index({ project: 1, timestamp: -1 });

module.exports = mongoose.model('MonitoringUpdate', MonitoringUpdateSchema);
