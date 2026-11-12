const express = require('express');
const helmet = require('helmet');
const path = require('path');
const app = express();
app.use(helmet());
app.use(express.static('public'));
app.get('/health', (req, res) => res.send('OK'));
app.get('/api/v1/data', (req, res) => res.json({data: 'success'}));
app.listen(3000, () => console.log('Server running on port 3000'));
