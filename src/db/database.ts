// src/db/database.ts
import * as SQLite from 'expo-sqlite';
import type { Receipt, ReceiptCategory } from '../types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = (): Promise<SQLite.SQLiteDatabase> => {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabaseAsync('receiptrocket.db');
    }
    return dbPromise;
};

export const initDb = async (): Promise<void> => {
    const db = await getDb();
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant TEXT,
      date TEXT,
      total REAL,
      category TEXT,
      notes TEXT,
      imageUri TEXT,
      createdAt TEXT,
      ocrConfidence REAL
    );
  `);
};

export const insertReceipt = async (
    merchant: string,
    date: string,
    total: number,
    category: ReceiptCategory | null,
    notes: string | null,
    imageUri: string | null,
    ocrConfidence: number | null
): Promise<number> => {
    const db = await getDb();
    const createdAt = new Date().toISOString();

    const res = await db.runAsync(
        `INSERT INTO receipts
       (merchant, date, total, category, notes, imageUri, createdAt, ocrConfidence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        merchant, date, total, category ?? null, notes ?? null, imageUri ?? null, createdAt, ocrConfidence ?? null
    );
    return Number(res.lastInsertRowId ?? 0);
};

export const updateReceipt = async (
    id: number,
    merchant: string,
    date: string,
    total: number,
    category: ReceiptCategory | null,
    notes: string | null
): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
        `UPDATE receipts
       SET merchant = ?, date = ?, total = ?, category = ?, notes = ?
     WHERE id = ?`,
        merchant, date, total, category ?? null, notes ?? null, id
    );
};

export const getAllReceipts = async (): Promise<Receipt[]> => {
    const db = await getDb();
    const rows = await db.getAllAsync<Receipt>(`SELECT * FROM receipts ORDER BY createdAt DESC`);
    return rows;
};

export const getReceiptById = async (id: number): Promise<Receipt | null> => {
    const db = await getDb();
    const row = await db.getFirstAsync<Receipt>(`SELECT * FROM receipts WHERE id = ?`, id);
    return row ?? null;
};
