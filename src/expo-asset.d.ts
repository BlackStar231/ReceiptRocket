// src/types/expo-asset.d.ts
declare module 'expo-asset' {
    export class Asset {

        static fromModule(moduleId: number | string): Asset;

        
        static fromURI(uri: string): Asset;

        downloadAsync(): Promise<void>;
        localUri?: string;
        uri: string;
    }
}
