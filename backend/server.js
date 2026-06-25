require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log incoming API calls
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// API Routes
app.use('/api', routes);

// Base route test
app.get('/', (req, res) => {
  res.json({
    message: "CampusFlow Backend API is running!",
    time: new Date().toISOString(),
    simulationMode: {
      ai: !process.env.GEMINI_API_KEY,
      n8n_deadline: !process.env.N8N_DEADLINE_WEBHOOK_URL,
      n8n_notice: !process.env.N8N_NOTICE_WEBHOOK_URL
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CampusFlow Server running on: http://localhost:${PORT}`);
  console.log(`📂 Database: backend/db.json`);
  console.log(`💡 AI Mode: ${process.env.GEMINI_API_KEY ? 'Active (Google Gemini)' : 'Simulation (Offline Mode)'}`);
  console.log(`🔗 n8n Deadline webhook: ${process.env.N8N_DEADLINE_WEBHOOK_URL ? 'Connected' : 'Offline Simulation'}`);
  console.log(`🔗 n8n Notice webhook: ${process.env.N8N_NOTICE_WEBHOOK_URL ? 'Connected' : 'Offline Simulation'}`);
  console.log(`======================================================\n`);
});
