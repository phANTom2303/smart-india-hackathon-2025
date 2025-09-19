const express = require('express');
const router = express.Router();

const monitoringUpdateRouter = require('./monitoringUpdateRouter');
const organizationRouter = require('./organizationRouter');
const projectRouter = require('./projectRouter');
const reportRouter = require('./reportRouter');
router.use('/monitoring-updates', monitoringUpdateRouter);
router.use('/organization', organizationRouter);
router.use('/project', projectRouter);
router.use('/report', reportRouter);

module.exports = router;