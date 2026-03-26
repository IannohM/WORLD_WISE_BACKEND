const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'cities.json');

// Create data folder and file if they don't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ cities: [] }, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'WorldWise Backend is running!',
        status: 'ok',
        port: PORT,
    });
});

// Helper: Read data
const readData = () => {
    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileContent);
    } catch (err) {
        console.error('Error reading data file:', err);
        return { cities: [] };
    }
};

// Helper: Write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing data file:', err);
    }
};

// GET all cities
app.get('/cities', (req, res) => {
    const data = readData();
    res.json(data.cities);
});

// GET one city by id
app.get('/cities/:id', (req, res) => {
    const data = readData();
    const city = data.cities.find((c) => c.id === req.params.id);

    if (!city) {
        return res.status(404).json({ message: 'City not found' });
    }

    res.json(city);
});

// POST new city
app.post('/cities', (req, res) => {
    const data = readData();

    const newCity = {
        id: 'c' + Date.now(),
        cityName: req.body.cityName,
        country: req.body.country,
        emoji: req.body.emoji,
        date: req.body.date,
        notes: req.body.notes || '',
        position: req.body.position,
    };

    data.cities.push(newCity);
    writeData(data);

    res.status(201).json(newCity);
});

// DELETE city
app.delete('/cities/:id', (req, res) => {
    const data = readData();
    const initialLength = data.cities.length;

    data.cities = data.cities.filter((c) => c.id !== req.params.id);

    if (data.cities.length === initialLength) {
        return res.status(404).json({ message: 'City not found' });
    }

    writeData(data);
    res.status(204).end();
});

app.listen(PORT, () => {
    console.log(`✅ WorldWise backend is running on port ${PORT}`);
    console.log(`📁 Data is saved in: ${DATA_FILE}`);
});
