import express from 'express';
import bodyParser from 'body-parser';
import WebhookController from './controllers/webhookController.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.post('/webhooks/call-events', WebhookController.handleCallEvent);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;