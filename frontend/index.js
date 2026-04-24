import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.API_BASE_URL = '${process.env.API_URL || 'http://localhost:8000'}';`);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
  const call = fetch(`${process.env.API_URL || 'http://localhost:8000'}/api/health`).catch(() => {});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FoundIt running → http://localhost:${PORT}`));
