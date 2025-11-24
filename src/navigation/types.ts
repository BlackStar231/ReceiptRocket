// src/navigation/types.ts
export type RootStackParamList = {
    Home: undefined;
    Scan: undefined;
    ReceiptDetails: {
        receiptId?: number;
        imageUri?: string | null;
        merchant?: string | null;
        date?: string | null;
        total?: number | null;
        confidence?: number | null;
    };
    EditTags: {
        category?: 'Food' | 'Travel' | 'Office' | 'Misc' | null;
        notes?: string | null;
        onSave?: (category: string | null, notes: string) => void; // optional callback
    };
    Export: undefined;
};
