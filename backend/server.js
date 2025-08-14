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
        'http://localhost:5174', // Add port 5174 as backup
        'http://localhost:3000'  // Add port 3000 as backup
    ],
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser()); // Parse cookies for refresh tokens
app.use('/api/auth', authRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/analytics', analyticsRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
