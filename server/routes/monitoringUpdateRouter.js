const express = require('express');
const monitoringUpdateRouter = express.Router();
const { MonitoringUpdate } = require('../models');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'monitoring');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '_').toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image uploads are allowed'));
        }
        cb(null, true);
    }
});

monitoringUpdateRouter.get('/', async (req,res) => {
    const fetchedMonitoringUpdates = await MonitoringUpdate.find({}).sort({ timestamp: -1 });
    return res.json(fetchedMonitoringUpdates);
})

// POST /api/monitoring-updates
// multipart fields: image (file), project, submittedBy, evidenceType, dataPayload (JSON string optional)
monitoringUpdateRouter.post('/', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required (multipart field "image")' });
        }

        const { project, submittedBy, evidenceType, dataPayload } = req.body;
        if (!project || !submittedBy || !evidenceType) {
            return res.status(400).json({ message: 'project, submittedBy, and evidenceType are required' });
        }

        let parsedPayload = undefined;
        if (dataPayload) {
            try {
                parsedPayload = typeof dataPayload === 'string' ? JSON.parse(dataPayload) : dataPayload;
            } catch (e) {
                return res.status(400).json({ message: 'dataPayload must be valid JSON' });
            }
        }

        // Use a path relative to server root so it can be served via /uploads
        const relativePath = path.join('uploads', 'monitoring', req.file.filename);

        // Placeholder for IPFS hash generation
        const ipfsHash = await addToIPFS(req.file.path);

        const created = await MonitoringUpdate.create({
            project,
            submittedBy,
            evidenceType,
            filePath: relativePath,
            ipfsHash,
            dataPayload: parsedPayload,
        });

        return res.status(201).json(created);
    } catch (err) {
        // If multer error
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});

// Placeholder: implement IPFS client upload and return CID string
async function addToIPFS(localFilePath) {
    // TODO: Replace with your IPFS client logic
    // Example:
    // const { create } = require('ipfs-http-client');
    // const ipfs = create({ url: process.env.IPFS_API_URL });
    // const fileData = await fs.promises.readFile(localFilePath);
    // const { cid } = await ipfs.add(fileData);
    // return cid.toString();
    return 'NULL';
}

module.exports = monitoringUpdateRouter;

// Update status: accept
monitoringUpdateRouter.post('/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid monitoring update id' });
        }

        const update = await MonitoringUpdate.findByIdAndUpdate(
            id,
            { $set: { status: 'ACCEPTED' } },
            { new: true }
        );

        if (!update) return res.status(404).json({ message: 'Monitoring update not found' });
        return res.status(200).json(update);
    } catch (err) {
        console.error('POST /api/monitoring-updates/:id/accept error:', err);
        return res.status(500).json({ message: 'Failed to accept monitoring update' });
    }
});

// Update status: reject
monitoringUpdateRouter.post('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid monitoring update id' });
        }

        const update = await MonitoringUpdate.findByIdAndUpdate(
            id,
            { $set: { status: 'REJECTED' } },
            { new: true }
        );

        if (!update) return res.status(404).json({ message: 'Monitoring update not found' });
        return res.status(200).json(update);
    } catch (err) {
        console.error('POST /api/monitoring-updates/:id/reject error:', err);
        return res.status(500).json({ message: 'Failed to reject monitoring update' });
    }
});