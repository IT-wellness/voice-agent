import RecordingService from '../services/recordingService.js';
import logger from '../utils/logger.js';

export async function handleMediaPacket(callControlId, data) {
  try {
    // Check if data is audio (should be binary data)
    if (!(data instanceof ArrayBuffer)) {
      logger.warn(`Received non-binary data for call ${callControlId}`);
      return;
    }

    const dataView = new DataView(data);
    logger.debug(`Received audio packet for call ${callControlId}, length: ${dataView.byteLength} bytes`);
    
    // Convert to Buffer for saving (Node.js compatible)
    const bufferData = Buffer.from(data);
    
    // Save the raw audio chunk
    const filename = await RecordingService.saveAudioChunk(callControlId, bufferData);
    
    logger.info(`Saved audio from call ${callControlId} to ${filename}`);
    
  } catch (error) {
    logger.error(`Error handling media for call ${callControlId}: ${error.message}`);
  }
}

export default {
  handleMediaPacket
};