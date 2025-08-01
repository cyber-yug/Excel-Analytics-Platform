const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const ExcelData = require('../models/ExcelData');

const router = express.Router();

// Upload config
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel and CSV files are allowed!'), false);
        }
    }
});

// Upload and process file
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = path.join(__dirname, '..', req.file.path);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Extract headers
        const headers = Object.keys(sheetData[0] || {});
        
        // Save to database
        const excelDocument = new ExcelData({
            filename: req.file.filename,
            originalName: req.file.originalname,
            sheetName: sheetName,
            headers: headers,
            data: sheetData,
            rowCount: sheetData.length,
            columnCount: headers.length,
            fileSize: stats.size,
            userId: req.body.userId || 'anonymous'
        });

        await excelDocument.save();

        res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            fileId: excelDocument._id,
            data: sheetData,
            metadata: {
                filename: req.file.originalname,
                rows: sheetData.length,
                columns: headers.length,
                headers: headers,
                fileSize: stats.size
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Failed to process file',
            details: error.message 
        });
    }
});

// Get all uploaded files
router.get('/files', async (req, res) => {
    try {
        const files = await ExcelData.find({}, {
            data: 0 // Exclude large data field
        }).sort({ uploadDate: -1 });
        
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Get specific file data
router.get('/files/:id', async (req, res) => {
    try {
        const file = await ExcelData.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ file });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch file data' });
    }
});

module.exports = router;
