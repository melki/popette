require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const GoogleSheetsDB = require('./google-sheets');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Google Sheets database
const db = new GoogleSheetsDB();

// Initialize the sheet on startup
db.initializeSheet().catch(console.error);

// Routes
app.get('/api/status', async (req, res) => {
    try {
        const lastWatered = await db.getLastWatered();
        res.json({ 
            lastWatered: lastWatered ? lastWatered.timestamp : null 
        });
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/water', async (req, res) => {
    try {
        const { wateredBy = 'Unknown' } = req.body;
        const result = await db.addWatering(wateredBy);
        
        res.json({ 
            success: true, 
            lastWatered: result.timestamp,
            wateredBy: wateredBy
        });
    } catch (error) {
        console.error('Error adding watering:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await db.getHistory(10);
        res.json({ history: history.map(item => ({
            watered_at: item.timestamp,
            watered_by: item.user
        })) });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌱 Popette server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see your plant!`);
}); 