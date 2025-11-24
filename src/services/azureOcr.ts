// src/services/azureOcr.ts
import * as FileSystem from 'expo-file-system/legacy'; // stable legacy surface on SDK 54
import Constants from 'expo-constants';

export interface OcrResult {
    merchant: string | null;
    date: string | null;
    total: number | null;
    confidence: number | null;
}

type Extra = {
    azureEndpoint?: string;
    azureKey?: string;
    useMockOcr?: boolean;
    fallbackToMockOnError?: boolean;
};

const extra = (Constants.expoConfig?.extra ??
    (Constants as any).manifest?.extra ??
    {}) as Extra;

// ---- hard fail if anything is misconfigured (live-only build) ----
const rawEndpoint = (extra.azureEndpoint ?? process.env.EXPO_PUBLIC_AZURE_ENDPOINT ?? '').trim();
const AZURE_ENDPOINT = rawEndpoint.replace(/\/+$/, ''); // strip trailing slashes
const AZURE_KEY = (extra.azureKey ?? process.env.EXPO_PUBLIC_AZURE_KEY ?? '').trim();

if (!AZURE_ENDPOINT || !AZURE_KEY) {
    throw new Error('Azure endpoint/key missing. Set AZURE_ENDPOINT and AZURE_KEY (via .env or EAS secrets).');
}
if (/^https:https:\/\//i.test(AZURE_ENDPOINT)) {
    throw new Error(
        `AZURE_ENDPOINT is invalid ("${AZURE_ENDPOINT}"). Remove the duplicated "https:". 
Example: https://<your-resource>.cognitiveservices.azure.com`
    );
}
if (extra.useMockOcr) {
    throw new Error('Mock OCR is enabled in app.config.js. Set extra.useMockOcr = false for live OCR.');
}
if (extra.fallbackToMockOnError) {
    throw new Error('Set extra.fallbackToMockOnError = false for a full live build.');
}

const API_VERSION = '2023-07-31';
const MODEL_URL =
    `${AZURE_ENDPOINT}/formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=${API_VERSION}`;

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function parseDoc(json: any): OcrResult {
    const doc = json?.documents?.[0] ?? json?.analyzeResult?.documents?.[0] ?? null;
    if (!doc?.fields) return { merchant: null, date: null, total: null, confidence: null };

    const f = doc.fields;
    const merchantField = f.MerchantName ?? f.Merchant ?? null;
    const dateField = f.TransactionDate ?? f.Date ?? null;
    const totalField = f.Total ?? f.GrandTotal ?? null;

    const merchant = merchantField?.content ?? null;
    const date = dateField?.content ?? null;

    let total: number | null = null;
    if (typeof totalField?.valueNumber === 'number') total = totalField.valueNumber;
    else if (typeof totalField?.content === 'string') {
        const n = Number(totalField.content.replace(/[^\d.]/g, ''));
        total = Number.isFinite(n) ? n : null;
    }

    const confs: number[] = [merchantField?.confidence, dateField?.confidence, totalField?.confidence]
        .filter((c: any): c is number => typeof c === 'number');
    const confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null;

    return { merchant, date, total, confidence };
}

async function pollOperation(opUrl: string, timeoutMs = 30000, intervalMs = 1000): Promise<any> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const r = await fetch(opUrl, { headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY } });
        if (!r.ok) throw new Error(`Azure poll failed (${r.status}): ${await r.text().catch(() => '')}`);
        const j = await r.json();
        const status = (j.status || j.analyzeResult?.status || '').toString().toLowerCase();
        if (!status || status === 'succeeded') return j;
        if (status === 'failed') throw new Error('Azure analyze failed (status=failed)');
        await sleep(intervalMs);
    }
    throw new Error('Azure analyze timed out');
}

/**
 * Live OCR: uploads the local image file as raw binary using FileSystem.uploadAsync.
 * No Blob usage (avoids RN "Creating blobs..." errors).
 */
export const analyzeReceiptImage = async (imageUri: string): Promise<OcrResult> => {
    if (__DEV__) {
        console.log('[OCR] endpoint:', AZURE_ENDPOINT);
        console.log('[OCR] key length:', AZURE_KEY.length);
    }

    // POST the file as binary content
    const res: any = await (FileSystem as any).uploadAsync(MODEL_URL, imageUri, {
        httpMethod: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/octet-stream',
        },
        uploadType: (FileSystem as any).FileSystemUploadType.BINARY_CONTENT,
    });

    // Normalize headers to lower-case keys for easier lookup
    const headers = Object.fromEntries(
        Object.entries(res.headers ?? {}).map(([k, v]) => [String(k).toLowerCase(), v])
    );

    if (res.status === 202) {
        const op = headers['operation-location'];
        if (!op) throw new Error('Azure returned 202 but no operation-location header was present.');
        const resultJson = await pollOperation(String(op));
        return parseDoc(resultJson);
    }

    if (res.status >= 200 && res.status < 300) {
        // Some Azure endpoints may return immediate JSON
        try {
            const bodyJson = JSON.parse(res.body ?? '{}');
            return parseDoc(bodyJson);
        } catch (e) {
            throw new Error(`Azure analyze returned ${res.status} but body was not JSON.`);
        }
    }

    // Error case
    throw new Error(`Azure analyze failed (${res.status}): ${res.body ?? ''}`);
};
