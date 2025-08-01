const express = require('express');
const ExcelData = require('../models/ExcelData');

const router = express.Router();

// Get basic statistics for a file
router.get('/stats/:fileId', async (req, res) => {
    try {
        const file = await ExcelData.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const data = file.data;
        const stats = {
            totalRows: data.length,
            totalColumns: file.headers.length,
            headers: file.headers,
            numericalColumns: [],
            categoricalColumns: [],
            summary: {}
        };

        // Analyze each column
        file.headers.forEach(header => {
            const columnData = data.map(row => row[header]).filter(val => val !== null && val !== undefined && val !== '');
            
            if (columnData.length === 0) return;

            // Check if column is numerical
            const isNumerical = columnData.every(val => !isNaN(parseFloat(val)) && isFinite(val));
            
            if (isNumerical) {
                stats.numericalColumns.push(header);
                const numbers = columnData.map(val => parseFloat(val));
                stats.summary[header] = {
                    type: 'numerical',
                    min: Math.min(...numbers),
                    max: Math.max(...numbers),
                    avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
                    count: numbers.length
                };
            } else {
                stats.categoricalColumns.push(header);
                const uniqueValues = [...new Set(columnData)];
                const valueCounts = {};
                columnData.forEach(val => {
                    valueCounts[val] = (valueCounts[val] || 0) + 1;
                });
                
                stats.summary[header] = {
                    type: 'categorical',
                    uniqueCount: uniqueValues.length,
                    topValues: Object.entries(valueCounts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([value, count]) => ({ value, count })),
                    totalCount: columnData.length
                };
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate statistics' });
    }
});

// Generate chart data for specific columns
router.post('/chart/:fileId', async (req, res) => {
    try {
        const { chartType, xColumn, yColumn, groupBy } = req.body;
        const file = await ExcelData.findById(req.params.fileId);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const data = file.data;
        let chartData = {};

        switch (chartType) {
            case 'bar':
            case 'column':
                if (groupBy) {
                    // Group data by category
                    const grouped = {};
                    data.forEach(row => {
                        const category = row[groupBy];
                        if (!grouped[category]) grouped[category] = 0;
                        grouped[category]++;
                    });
                    
                    chartData = {
                        labels: Object.keys(grouped),
                        datasets: [{
                            label: `Count by ${groupBy}`,
                            data: Object.values(grouped),
                            backgroundColor: generateColors(Object.keys(grouped).length)
                        }]
                    };
                } else if (xColumn && yColumn) {
                    // X vs Y analysis
                    const processedData = data.map(row => ({
                        x: row[xColumn],
                        y: parseFloat(row[yColumn]) || 0
                    })).filter(item => item.x && !isNaN(item.y));
                    
                    chartData = {
                        labels: processedData.map(item => item.x),
                        datasets: [{
                            label: `${yColumn} by ${xColumn}`,
                            data: processedData.map(item => item.y),
                            backgroundColor: generateColors(processedData.length)
                        }]
                    };
                }
                break;

            case 'pie':
            case 'doughnut':
                if (groupBy) {
                    const grouped = {};
                    data.forEach(row => {
                        const category = row[groupBy];
                        if (!grouped[category]) grouped[category] = 0;
                        grouped[category]++;
                    });
                    
                    chartData = {
                        labels: Object.keys(grouped),
                        datasets: [{
                            data: Object.values(grouped),
                            backgroundColor: generateColors(Object.keys(grouped).length)
                        }]
                    };
                }
                break;

            case 'line':
                if (xColumn && yColumn) {
                    const processedData = data
                        .map(row => ({
                            x: row[xColumn],
                            y: parseFloat(row[yColumn]) || 0
                        }))
                        .filter(item => item.x && !isNaN(item.y))
                        .sort((a, b) => new Date(a.x) - new Date(b.x) || a.x.localeCompare(b.x));
                    
                    chartData = {
                        labels: processedData.map(item => item.x),
                        datasets: [{
                            label: `${yColumn} over ${xColumn}`,
                            data: processedData.map(item => item.y),
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true
                        }]
                    };
                }
                break;
        }

        res.json({ chartType, chartData });
    } catch (error) {
        console.error('Chart generation error:', error);
        res.status(500).json({ error: 'Failed to generate chart data' });
    }
});

// Helper function to generate colors
function generateColors(count) {
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

module.exports = router;
