import TelnyxService from '../services/telnyxService.js';
import RecordingService from '../services/recordingService.js';
import { getFileForDownload } from '../utils/fileHelpers.js';
import logger from '../utils/logger.js';

export class CallController {
  static async initiateCall(req, res) {
    try {
      const { to } = req.body;
      if (!to) {
        return res.status(400).json({ error: 'Missing "to" number' });
      }

      const call = await TelnyxService.initiateOutboundCall(to);
      res.json({
        success: true,
        callControlId: call.call_control_id,
        message: `Call initiated to ${to}`
      });
    } catch (error) {
      logger.error(`Error initiating call: ${error.message}`);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  }

  static async listRecordings(req, res) {
    try {
      const recordings = await RecordingService.listRecordings();
      res.json({ recordings });
    } catch (error) {
      logger.error(`Error listing recordings: ${error.message}`);
      res.status(500).json({ error: 'Failed to list recordings' });
    }
  }

  static async downloadRecording(req, res) {
    try {
      const { filename } = req.params;
      const file = await getFileForDownload(filename);
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Length', file.size);
      
      res.download(file.path);
    } catch (error) {
      logger.error(`Error downloading recording: ${error.message}`);
      res.status(404).json({ error: 'Recording not found' });
    }
  }
}

export default CallController;