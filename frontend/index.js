const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(require('cors')());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// Serve environment variables to frontend
app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.API_BASE_URL = '${process.env.API_BASE_URL || 'http://localhost:8000'}';`);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FoundIt running → http://localhost:${PORT}`));
