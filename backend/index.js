const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const uploadRoute = require('./routes/upload');
const analyticsRoute = require('./routes/analytics');
const authRoute = require('./routes/auth');

const app = express();

// CORS configuration for authentication
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://excel-analytics-platform.vercel.app', // Add your Vercel domain
        /\.vercel\.app$/ // Allow all Vercel preview deployments
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Excel Analytics Platform API is running' });
});

app.use('/api/auth', authRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/analytics', analyticsRoute);

// Connect to MongoDB
let cachedConnection = null;

async function connectToDatabase() {
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            bufferCommands: false,
            bufferMaxEntries: 0,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        cachedConnection = connection;
        console.log("✅ MongoDB connected");
        return connection;
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        throw err;
    }
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Export for Vercel
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
