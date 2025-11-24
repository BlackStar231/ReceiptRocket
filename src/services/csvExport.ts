// src/services/csvExport.ts
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Receipt } from '../types';

const FS: any = FileSystem;

const ensureExportDir = async (): Promise<string> => {
    const base: string | undefined = FS.documentDirectory ?? FS.cacheDirectory;
    if (!base) throw new Error('No writable directory available on this platform.');
    const dir = base + 'exports/';
    const info = await FS.getInfoAsync(dir);
    if (!info.exists) {
        await FS.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
};

const escapeCsv = (v: string | number | null): string => {
    if (v == null) return '';
    const s = String(v);
    return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const exportReceiptsToCsv = async (receipts: Receipt[], fileName = 'receipts.csv'): Promise<string> => {
    const dir = await ensureExportDir();

    const header = ['id', 'merchant', 'date', 'total', 'category', 'notes', 'createdAt', 'ocrConfidence'].join(',') + '\n';
    const rows = receipts.map(r => [
        escapeCsv(r.id),
        escapeCsv(r.merchant),
        escapeCsv(r.date),
        escapeCsv(r.total),
        escapeCsv(r.category),
        escapeCsv(r.notes),
        escapeCsv(r.createdAt),
        escapeCsv(r.ocrConfidence),
    ].join(',')).join('\n');

    const csv = header + rows + '\n';
    const fileUri = dir + fileName;

    await FS.writeAsStringAsync(fileUri, csv);
    return fileUri;
};

export const shareCsvFile = async (fileUri: string): Promise<void> => {
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
    } else {
        console.warn('Sharing not available on this device');
    }
};
