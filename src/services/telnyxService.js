import Telnyx from '@telnyx/v2';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const telnyx = Telnyx(config.telnyx.apiKey);

export class TelnyxService {
    static async initiateOutboundCall(toNumber, fromNumber = config.telnyx.phoneNumber) {
        try {
            const call = await telnyx.calls.createDial({
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

            logger.info(`Outbound call initiated to ${toNumber}: ${call.call_control_id}`);
            return call;
        } catch (error) {
            logger.error(`Error initiating outbound call: ${error.message}`);
            throw error;
        }
    }

    static async startStreaming(callControlId, streamUrl) {
        try {
            const response = await telnyx.calls.command(callControlId, {
                command: 'stream',
                stream_url: streamUrl,
                audio_direction: 'both',
                stream_track: 'both_tracks',
                target_protocol: 'wss'
            });
            return response;
        } catch (error) {
            logger.error(`Error starting streaming for call ${callControlId}: ${error.message}`);
            throw error;
        }
    }

    static async playAudio(callControlId, audioUrl) {
        try {
            const response = await telnyx.calls.command(callControlId, {
                command: 'playback_start',
                media_url: audioUrl,
                loop: false,
                overlay: false
            });
            return response;
        } catch (error) {
            logger.error(`Error playing audio for call ${callControlId}: ${error.message}`);
            throw error;
        }
    }

    static async hangupCall(callControlId) {
        try {
            const response = await telnyx.calls.command(callControlId, {
                command: 'hangup',
                reason: 'normal_clearing'
            });
            return response;
        } catch (error) {
            logger.error(`Error hanging up call ${callControlId}: ${error.message}`);
            throw error;
        }
    }
    
    static async speakText(callControlId, text, voice = 'male') {
        try {
            const response = await telnyx.calls.command(callControlId, {
                command: 'speak',
                payload: text,
                voice,
                language: 'en-US',
                payload_type: 'text',
                service_level: 'enhanced'
            });
            return response;
        } catch (error) {
            logger.error(`Error speaking text for call ${callControlId}: ${error.message}`);
            throw error;
        }
    }
}

export default TelnyxService;