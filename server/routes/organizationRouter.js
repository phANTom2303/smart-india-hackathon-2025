const express = require('express');
const {Organization} = require('../models');
const organizationRouter = express.Router();

organizationRouter.get('/', async (req,res) => {
    const fetchedOrganizations = await Organization.find({});
    return res.status(200).json(fetchedOrganizations);
});

module.exports = organizationRouter;