import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = path.join(__dirname, '../../../recordings');

export class RecordingService {
  static async ensureRecordingsDir() {
    try {
      await fs.mkdir(RECORDINGS_DIR, { recursive: true });
    } catch (err) {
      logger.error(`Error creating recordings directory: ${err.message}`);
      throw err;
    }
  }

  static async saveAudioChunk(callControlId, data) {
    await this.ensureRecordingsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `call_${callControlId}_${timestamp}.raw`;
    const filepath = path.join(RECORDINGS_DIR, filename);
    
    try {
      await fs.writeFile(filepath, data);
      logger.info(`Saved audio chunk: ${filename}`);
      return filename;
    } catch (err) {
      logger.error(`Error saving audio chunk: ${err.message}`);
      throw err;
    }
  }

  static async listRecordings() {
    await this.ensureRecordingsDir();
    try {
      const files = await fs.readdir(RECORDINGS_DIR);
      return files.filter(file => file.endsWith('.raw'));
    } catch (err) {
      logger.error(`Error listing recordings: ${err.message}`);
      throw err;
    }
  }

  static async getRecordingPath(filename) {
    await this.ensureRecordingsDir();
    const filepath = path.join(RECORDINGS_DIR, filename);
    try {
      await fs.access(filepath);
      return filepath;
    } catch (err) {
      logger.error(`Recording not found: ${filename}`);
      throw err;
    }
  }
}

export default RecordingService;