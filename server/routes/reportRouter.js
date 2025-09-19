const express = require('express');
const router = express.Router();
const { VerificationReport, Project } = require('../models');

// GET /api/report - fetch all verification reports
router.get('/', async (req, res) => {
  try {
    // populate minimal fields to display alongside report
    const reports = await VerificationReport.find({})
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(reports);
  } catch (err) {
  console.error('GET /api/report error:', err);
  return res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Helper to normalize various UI statuses to DB enum
function normalizeStatus(input) {
  if (!input) return 'PENDING';
  const val = String(input).trim().toUpperCase();
  // Accept UI terms and DB enums
  switch (val) {
    case 'DRAFT':
    case 'PENDING':
      return 'PENDING';
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return 'IN_REVIEW';
    case 'VERIFIED':
    case 'APPROVED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
}

// POST /api/report - create a verification report
router.post('/', async (req, res) => {
  try {
    const {
      name,
      project, // ObjectId string
      monitoringStartPeriod,
      monitoringEndPeriod,
      status,
      verifiedCarbonAmount,
      verifier,
      verificationTxHash,
    } = req.body || {};

    // Basic required fields
    if (!name || !project || !monitoringStartPeriod || !monitoringEndPeriod) {
      return res.status(400).json({
        message: 'name, project, monitoringStartPeriod, and monitoringEndPeriod are required.',
      });
    }

    // Ensure referenced project exists
    const proj = await Project.findById(project).select('_id name');
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Dates validation
    const start = new Date(monitoringStartPeriod);
    const end = new Date(monitoringEndPeriod);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid monitoring period dates' });
    }
    if (start > end) {
      return res.status(400).json({ message: 'monitoringStartPeriod must be before monitoringEndPeriod' });
    }

    // Normalize/shape payload
    const payload = {
      name: String(name).trim(),
      project: proj._id,
      monitoringStartPeriod: start,
      monitoringEndPeriod: end,
      status: normalizeStatus(status),
      verifiedCarbonAmount:
        typeof verifiedCarbonAmount === 'number'
          ? verifiedCarbonAmount
          : Number(verifiedCarbonAmount) || 0,
    };

    if (verifier) payload.verifier = verifier; // optional
    if (verificationTxHash) payload.verificationTxHash = verificationTxHash; // optional

    const created = await VerificationReport.create(payload);

    const result = await VerificationReport.findById(created._id)
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .lean();

    return res.status(201).json(result);
  } catch (err) {
    console.error('POST /api/report error:', err);
    return res.status(500).json({ message: 'Failed to create report' });
  }
});

module.exports = router;
