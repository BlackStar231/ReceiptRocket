// app.config.js
require('dotenv').config();

module.exports = {
    expo: {
        name: 'ReceiptRocket',
        slug: 'receiptrocket',
        scheme: 'receiptrocket',
        version: '1.0.0',
        platforms: ['android'],
        extra: {
            // Live Azure only:
            useMockOcr: false,
            fallbackToMockOnError: false,

            // Secrets (from .env locally or EAS secrets in CI)
            azureEndpoint: process.env.AZURE_ENDPOINT,
            azureKey: process.env.AZURE_KEY,

            // EAS project (yours)
            eas: { projectId: '460e0cc2-742f-4072-8950-7ec3d3b6351a' }
        }
    }
};
