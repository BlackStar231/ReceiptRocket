export type ReceiptCategory = 'Food' | 'Travel' | 'Office' | 'Misc';

export interface Receipt {
    id: number;
    merchant: string;
    date: string; // e.g. "2024-11-18"
    total: number;
    category: ReceiptCategory | null;
    notes: string | null;
    imageUri: string | null;
    createdAt: string; // ISO datetime
    ocrConfidence: number | null;
}
