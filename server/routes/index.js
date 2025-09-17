const express = require('express');
const router = express.Router();

const monitoringUpdateRouter = require('./monitoringUpdateRouter');

router.use('/monitoring-updates', monitoringUpdateRouter);

module.exports = router;