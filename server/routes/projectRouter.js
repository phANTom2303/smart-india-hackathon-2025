const express = require('express');
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
projectRouter.get('/:id/monitoring', async (req, res, next) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id).select('name _id').lean();
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const updates = await MonitoringUpdate.find({ project: id })
            .sort({ timestamp: -1 })
            .lean();

        const monitoringRecords = updates.map(u => ({
            timestamp: u.timestamp ? new Date(u.timestamp).toISOString() : '',
            evidence: u.filePath ? String(u.filePath).split('/').pop() : (u.ipfsHash && u.ipfsHash !== 'NULL' ? u.ipfsHash : ''),
            evidenceType: u.evidenceType || '',
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
        next(err);
    }
});