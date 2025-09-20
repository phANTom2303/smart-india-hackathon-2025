const express = require('express');
const mongoose = require('mongoose');
const { Project, MonitoringUpdate } = require('../models');
const projectRouter = express.Router();

projectRouter.get('/', async (req, res, next) => {
    try {
        // Populate only the 'name' field, then convert to plain objects and replace with string
        const projects = await Project.find({})
            .populate({ path: 'organization', select: 'name -_id' })
            .lean();

        const shaped = projects.map(p => ({
            ...p,
            organization: p.organization?.name || null
        }));

        return res.status(200).json(shaped);
    } catch (err) {
        next(err);
    }
});

module.exports = projectRouter;

// New: Get monitoring updates for a specific project, shaped for client
projectRouter.get('/:id/monitoring', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format early
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid project id' });
        }

        const project = await Project.findById(id).select('name _id').lean();
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const updates = await MonitoringUpdate.find({ project: id })
            .sort({ timestamp: -1 })
            .lean();

        const monitoringRecords = updates.map(u => ({
            id: String(u._id),
            timestamp: u.timestamp ? new Date(u.timestamp).toISOString() : '',
            evidence: u.filePath ? String(u.filePath).split('/').pop() : (u.ipfsHash && u.ipfsHash !== 'NULL' ? u.ipfsHash : ''),
            evidenceType: u.evidenceType || '',
            status: u.status || 'PENDING',
            dataPayload: {
                speciesPlanted: u.dataPayload?.speciesPlanted || '',
                numberOfTrees: u.dataPayload?.numberOfTrees || '',
                notes: u.dataPayload?.notes || ''
            }
        }));

        return res.status(200).json({
            projectName: project.name,
            projectInfo: { id: String(project._id), projectId: String(project._id) },
            monitoringRecords
        });
    } catch (err) {
        console.error('Error fetching monitoring updates:', err);
        const status = err?.name === 'CastError' ? 400 : 500;
        return res.status(status).json({
            message: status === 400 ? 'Invalid project id' : 'Failed to fetch monitoring updates',
            error: err?.message || 'Unknown error'
        });
    }
});