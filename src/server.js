import app from './app.js';
import MediaSocketServer from './websocket/server.js';
import config from './config/index.js';
import logger from './utils/logger.js';

// HTTP Server
const httpServer = app.listen(config.server.port, () => {
  logger.info(`HTTP server listening on port ${config.server.port}`);
}).on('error', (err) => {
  logger.error(`HTTP server error: ${err.message}`);
});

// WebSocket Server for Media
const mediaSocketServer = new MediaSocketServer(config.server.wsPort);
logger.info(`WebSocket server for media listening on port ${config.server.wsPort}`);
// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  httpServer.close(() => {
    mediaSocketServer.close();
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error(`Unhandled Rejection at: ${p}, reason: ${reason}`);
});