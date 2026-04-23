const express = require('express');
const path = require('path');
const app = express();

app.use(require('cors')());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FoundIt running → http://localhost:${PORT}`));
