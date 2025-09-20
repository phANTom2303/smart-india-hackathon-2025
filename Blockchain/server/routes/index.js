const express = require('express');
const router = express.Router();

const monitoringUpdateRouter = require('./monitoringUpdateRouter');
const organizationRouter = require('./organizationRouter');
const projectRouter = require('./projectRouter');
router.use('/monitoring-updates', monitoringUpdateRouter);
router.use('/organization', organizationRouter);
router.use('/project', projectRouter);

module.exports = router;