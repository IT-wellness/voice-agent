import TelnyxService from '../services/telnyxService.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export class WebhookController {
  static async handleCallEvent(req, res) {
    const event = req.body.data;
    logger.info(`Received Telnyx event: ${event.event_type}`);

    try {
        const telnyxSignature = req.headers['telnyx-signature-ed25519'];
        const timestamp = req.headers['telnyx-timestamp'];
      switch (event.event_type) {
        case 'call.initiated':
          await this.handleCallInitiated(event);
          break;
        case 'call.answered':
          await this.handleCallAnswered(event);
          break;
        case 'call.hangup':
          await this.handleCallHangup(event);
          break;
        case 'call.machine.detection.ended':
            await this.handleMachineDetection(event);
            break;
        default:
          logger.debug(`Unhandled event type: ${event.event_type}`);
      }
      
      res.status(200).end();
    } catch (error) {
      logger.error(`Error handling webhook event: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async handleCallInitiated(event) {
    logger.info(`Call initiated: ${event.payload.call_control_id}`);
    // You can access client_state if needed
    const clientState = event.payload.client_state ? JSON.parse(event.payload.client_state) : null;
    logger.debug(`Client state: ${JSON.stringify(clientState)}`);
  }

  static async handleCallAnswered(event) {
    const { call_control_id } = event.payload;
    logger.info(`Call answered: ${call_control_id}`);
    
    // Play welcome message using Telnyx speak command
     await TelnyxService.speakText(
      call_control_id,
      "Hello! Thank you for calling. Please speak after the beep. Your voice will be recorded for testing purposes. *BEEP*",
      'male'
    );
    
    // Start media streaming
    const wsUrl = `wss://${config.webhook.baseUrl}/media?call_control_id=${call_control_id}`;
    await TelnyxService.startStreaming(call_control_id, wsUrl);
  }

  static async handleCallHangup(event) {
    const { call_control_id } = event.payload;
    logger.info(`Call hangup: ${call_control_id}`);
    
    // Clean up resources
    // Update database status if needed
  }

  static async handleMachineDetection(event) {
    const { call_control_id, result } = event.payload;
    logger.info(`Machine detection ended for call ${call_control_id}: ${result}`);
    
    if (result === 'human') {
      // Handle human answer
      await this.handleCallAnswered(event);
    } else {
      // Handle answering machine
      logger.info(`Answering machine detected for call ${call_control_id}`);
    }
  }

  // Signature verification method (to be implemented)
  static verifySignature(signature, timestamp, payload) {
    // Implementation per:
    // https://developers.telnyx.com/docs/verify-webhook-signatures
    return true; // Placeholder - implement actual verification
  }
}

export default WebhookController;