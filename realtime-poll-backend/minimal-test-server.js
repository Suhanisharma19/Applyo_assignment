const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Registering routes...');

// Simple test route
app.get('/test-simple', (req, res) => {
  console.log('GET /test-simple called');
  res.json({ message: 'Simple test route works!' });
});

// API test routes
app.get('/api/test', (req, res) => {
  console.log('GET /api/test called');
  res.json({ message: 'API test route works!' });
});

app.post('/api/test/create-test-poll', async (req, res) => {
  console.log('POST /api/test/create-test-poll called');
  res.json({ message: 'API test poll creation route works!' });
});

console.log('Routes registered');

// 404 handler
app.use((req, res) => {
  console.log('404 handler called for:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Minimal test server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('GET  /test-simple');
  console.log('GET  /api/test/');
  console.log('POST /api/test/create-test-poll');
});