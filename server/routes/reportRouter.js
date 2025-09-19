const express = require('express');
const router = express.Router();
const { VerificationReport, Project } = require('../models');

// GET /api/report - fetch all verification reports
router.get('/', async (req, res, next) => {
  try {
    // populate minimal fields to display alongside report
    const reports = await VerificationReport.find({})
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(reports);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
