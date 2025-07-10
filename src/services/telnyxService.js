import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const telnyx = axios.create({
  baseURL: 'https://api.telnyx.com/v2',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${config.telnyx.apiKey}`
  }
});

export class TelnyxService {
    static async initiateOutboundCall(toNumber, fromNumber = config.telnyx.phoneNumber) {
    try {
      const response = await telnyx.post('/calls', {
        connection_id: config.telnyx.appId,
        to: toNumber,
        from: fromNumber,
        webhook_url: `${config.webhook.baseUrl}/webhooks/call-events`,
        webhook_event_filters: [
          'call.initiated',
          'call.answered',
          'call.hangup',
          'call.machine.detection.ended'
        ],
        client_state: JSON.stringify({
          custom_tracking_id: `call_${Date.now()}`
        })
      });

      logger.info(`Outbound call initiated to ${toNumber}: ${response.data.data.call_control_id}`);
      return response.data.data;
    } catch (error) {
      logger.error(`Error initiating outbound call: ${error.response?.data?.errors || error.message}`);
      throw error;
    }
  }

  static async startStreaming(callControlId, streamUrl) {
    try {
      const response = await telnyx.post(`/calls/${callControlId}/actions/stream`, {
        stream_url: streamUrl,
        audio_direction: 'both',
        stream_track: 'both_tracks'
      });
      return response.data.data;
    } catch (error) {
      logger.error(`Error starting streaming for call ${callControlId}: ${error.response?.data?.errors || error.message}`);
      throw error;
    }
  }

  static async playAudio(callControlId, audioUrl) {
    try {
      const response = await telnyx.post(`/calls/${callControlId}/actions/playback_start`, {
        media_url: audioUrl,
        loop: false,
        overlay: false
      });
      return response.data.data;
    } catch (error) {
      logger.error(`Error playing audio for call ${callControlId}: ${error.response?.data?.errors || error.message}`);
      throw error;
    }
  }

  static async speakText(callControlId, text, voice = 'female') {
    try {
      const response = await telnyx.post(`/calls/${callControlId}/actions/speak`, {
        payload: text,
        voice,
        language: 'en-US',
        payload_type: 'text',
        service_level: 'enhanced'
      });
      return response.data.data;
    } catch (error) {
      logger.error(`Error speaking text for call ${callControlId}: ${error.response?.data?.errors || error.message}`);
      throw error;
    }
  }

  static async hangupCall(callControlId) {
    try {
      const response = await telnyx.post(`/calls/${callControlId}/actions/hangup`, {
        reason: 'normal_clearing'
      });
      return response.data.data;
    } catch (error) {
      logger.error(`Error hanging up call ${callControlId}: ${error.response?.data?.errors || error.message}`);
      throw error;
    }
  }
}

export default TelnyxService;