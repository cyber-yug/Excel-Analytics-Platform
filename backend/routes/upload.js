const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const router = express.Router();

// Upload config
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, '..', req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    res.json({ data: sheetData });
});

module.exports = router;
