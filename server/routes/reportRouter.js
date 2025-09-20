const express = require('express');
const router = express.Router();
const { VerificationReport, Project, MonitoringUpdate } = require('../models');
const mongoose = require('mongoose');

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

// GET /api/report/monitoring-range?projectId=...&monitoringStartDate=...&monitoringEndDate=...
// Returns monitoring updates for the given project within the provided date range (inclusive)
router.get('/monitoring-range/:projectId/:monitoringStartDate/:monitoringEndDate', async (req, res) => {
  try {
  const { projectId, monitoringStartDate, monitoringEndDate } = req.params || {};

    if (!projectId || !monitoringStartDate || !monitoringEndDate) {
      return res.status(400).json({
    message: 'projectId, monitoringStartDate, and monitoringEndDate are required path parameters',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }

    const start = new Date(monitoringStartDate);
    const end = new Date(monitoringEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid monitoringStartDate or monitoringEndDate' });
    }
    if (start > end) {
      return res.status(400).json({ message: 'monitoringStartDate must be before monitoringEndDate' });
    }

    // Query monitoring updates by project and timestamp range
    const records = await MonitoringUpdate.find({
      project: projectId,
      timestamp: { $gte: start, $lte: end },
    })
      .sort({ timestamp: -1 })
      .lean();

    // Shape response minimally; keep fields as stored
    return res.status(200).json({
      projectId,
      monitoringStartDate: start.toISOString(),
      monitoringEndDate: end.toISOString(),
      count: records.length,
      records,
    });
  } catch (err) {
    console.error('GET /api/report/monitoring-range error:', err);
    return res.status(500).json({ message: 'Failed to fetch monitoring records in range' });
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

// GET /api/report/:reportId - fetch a single verification report by id
router.get('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid reportId' });
    }

    const report = await VerificationReport.findById(reportId)
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .lean();

    if (!report) return res.status(404).json({ message: 'Report not found' });
    return res.status(200).json(report);
  } catch (err) {
    console.error('GET /api/report/:reportId error:', err);
    return res.status(500).json({ message: 'Failed to fetch report' });
  }
});

// PUT /api/report/:reportId - update report details (notes, verifiedCarbonAmount)
router.put('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid reportId' });
    }

    const { notes, verifiedCarbonAmount, totalCO2Offset, status } = req.body || {};
    const update = {};
    if (typeof notes === 'string') update.notes = notes;
    // Accept either verifiedCarbonAmount or totalCO2Offset from client
    const amount =
      typeof verifiedCarbonAmount === 'number'
        ? verifiedCarbonAmount
        : Number(totalCO2Offset);
    if (!Number.isNaN(amount) && Number.isFinite(amount)) {
      update.verifiedCarbonAmount = amount;
    }

    // Allow status update (normalized to enum)
    if (typeof status === 'string' && status.trim()) {
      update.status = normalizeStatus(status);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updated = await VerificationReport.findByIdAndUpdate(
      reportId,
      { $set: update },
      { new: true }
    )
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .lean();

    if (!updated) return res.status(404).json({ message: 'Report not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('PUT /api/report/:reportId error:', err);
    return res.status(500).json({ message: 'Failed to update report' });
  }
});

// POST /api/report/:reportId/submit - submit report for review (status -> IN_REVIEW)
router.post('/:reportId/submit', async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid reportId' });
    }

    const updated = await VerificationReport.findByIdAndUpdate(
      reportId,
      { $set: { status: 'IN_REVIEW' } },
      { new: true }
    )
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .lean();

    if (!updated) return res.status(404).json({ message: 'Report not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('POST /api/report/:reportId/submit error:', err);
    return res.status(500).json({ message: 'Failed to submit report' });
  }
});

// POST /api/report/:reportId/approve - approve report (status -> APPROVED)
router.post('/:reportId/approve', async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid reportId' });
    }

    const { notes, verifiedCarbonAmount, totalCO2Offset } = req.body || {};
    const update = { status: 'APPROVED' };
    if (typeof notes === 'string') update.notes = notes;
    const amount =
      typeof verifiedCarbonAmount === 'number'
        ? verifiedCarbonAmount
        : Number(totalCO2Offset);
    if (!Number.isNaN(amount) && Number.isFinite(amount)) {
      update.verifiedCarbonAmount = amount;
    }

    const updated = await VerificationReport.findByIdAndUpdate(
      reportId,
      { $set: update },
      { new: true }
    )
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .lean();

    if (!updated) return res.status(404).json({ message: 'Report not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('POST /api/report/:reportId/approve error:', err);
    return res.status(500).json({ message: 'Failed to approve report' });
  }
});

// POST /api/report/:reportId/reject - reject report (status -> REJECTED)
router.post('/:reportId/reject', async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid reportId' });
    }

    const { notes } = req.body || {};
    const update = { status: 'REJECTED' };
    if (typeof notes === 'string') update.notes = notes;

    const updated = await VerificationReport.findByIdAndUpdate(
      reportId,
      { $set: update },
      { new: true }
    )
      .populate({ path: 'project', select: 'name _id' })
      .populate({ path: 'verifier', select: 'name _id' })
      .lean();

    if (!updated) return res.status(404).json({ message: 'Report not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('POST /api/report/:reportId/reject error:', err);
    return res.status(500).json({ message: 'Failed to reject report' });
  }
});

module.exports = router;
