# ReceiptRocket (Proof of Concept)

Android-only receipt scanner built with Expo + React Native + TypeScript.  
**Scan -> OCR (Azure) -> Edit -> Save to SQLite -> Export CSV**.

## Screens & Flow
- **Home**: receipt list and “+” button.  
- **Scan**: live camera, capture or use a sample image.  
- **Receipt Details**: merchant/date/total prefilled from OCR; fully editable; save to DB.  
- **Export**: generate CSV and open the Android share sheet.

Code that wires this up:
- Scan screen: camera + call to OCR, then navigate to Details.
- Details: saves to SQLite and shows OCR confidence.
- Export: writes CSV and shares it.
- Root navigator & DB init: stacks screens and creates tables at boot.

## Tech Stack
- Expo (React Native), TypeScript
- Azure Document Intelligence (prebuilt **receipt**) for OCR
- expo-sqlite for local data, expo-file-system + expo-sharing for CSV
