const express = require('express');
const { Project } = require('../models');
const projectRouter = express.Router();

projectRouter.get('/', async (req, res) => {
    const fetchedProjects = await Project.find({});
    return res.status(200).json(fetchedProjects);
});

module.exports = projectRouter;