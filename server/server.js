const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const donorRoutes = require('./routes/donors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/donors', donorRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/search.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    } else {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🩸 Blood Donor Connect server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`📝 Register: http://localhost:${PORT}/register`);
    console.log(`🔍 Search: http://localhost:${PORT}/search`);
});