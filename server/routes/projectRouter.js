const express = require('express');
const { Project } = require('../models');
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