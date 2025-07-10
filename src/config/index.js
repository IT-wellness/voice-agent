import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
    telnyx: {
        apiKey: process.env.TELNYX_API_KEY,
        appId: process.env.TELNYX_APP_ID,
        phoneNumber: process.env.TELNYX_PHONE_NUMBER
    },
    webhook: {
        baseUrl: process.env.WEBHOOK_BASE_URL,
        secret: process.env.WEBHOOK_SECRET
    },
    server: {
        port: process.env.PORT || 5000,
        wsPort: process.env.WS_PORT || 8080
    }
};