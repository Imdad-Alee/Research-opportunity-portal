const express = require('express');
const cors = require('cors');
require('dotenv').config();

const opportunitiesRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger (helps you debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/opportunities', opportunitiesRouter);

// Root route — quick sanity check
app.get('/', (req, res) => {
  res.json({ message: 'Research Opportunity Portal API is running ✅' });
});

// 404 handler — for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/opportunities`);
});
