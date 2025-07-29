const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database(':memory:'); // Use file: './popette.db' for persistent storage

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS watering_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        watered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        watered_by TEXT DEFAULT 'Unknown'
    )`);
});

// Routes
app.get('/api/status', (req, res) => {
    db.get('SELECT watered_at FROM watering_log ORDER BY watered_at DESC LIMIT 1', (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ 
            lastWatered: row ? row.watered_at : null 
        });
    });
});

app.post('/api/water', (req, res) => {
    const { wateredBy = 'Unknown' } = req.body;
    
    db.run('INSERT INTO watering_log (watered_by) VALUES (?)', [wateredBy], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Get the newly inserted record
        db.get('SELECT watered_at FROM watering_log WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                lastWatered: row.watered_at,
                wateredBy: wateredBy
            });
        });
    });
});

app.get('/api/history', (req, res) => {
    db.all('SELECT watered_at, watered_by FROM watering_log ORDER BY watered_at DESC LIMIT 10', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ history: rows });
    });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌱 Popette server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see your plant!`);
}); 