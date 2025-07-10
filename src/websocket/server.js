import WebSocket from 'ws';
import { handleMediaPacket } from './handlers.js';
import logger from '../utils/logger.js';

export class MediaSocketServer {
  constructor(port) {
    this.port = port;
    this.server = new WebSocket.Server({ port });
    this.connections = new Map();

    this.server.on('connection', (ws, req) => {
      const url = new URL(req.url, `ws://${req.headers.host}`);
      const callControlId = url.searchParams.get('call_control_id');
      
      if (!callControlId) {
        logger.error('No call_control_id provided in WebSocket connection URL');
        ws.close(4000, 'Missing call_control_id');
        return;
      }

      ws.binaryType = 'arraybuffer';

      this.connections.set(callControlId, ws);
      logger.info(`New WebSocket connection for call: ${callControlId}`);

      ws.on('message', (data) => handleMediaPacket(callControlId, data));
      ws.on('close', () => {
        this.connections.delete(callControlId);
        logger.info(`WebSocket closed for call: ${callControlId}`);
    });

    ws.on('error', (error) => {
        logger.error(`WebSocket error for call ${callControlId}: ${error.message}`);
    });
    });
  }

  sendToCall(callControlId, data) {
    const ws = this.connections.get(callControlId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
      } catch (error) {
        logger.error(`Error sending data to call ${callControlId}: ${error.message}`);
      }
    }
  }

  close() {
    this.server.close(() => {
      logger.info('WebSocket server closed');
    });
  }
}

export default MediaSocketServer;