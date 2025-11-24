// src/screens/ScanScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Asset } from 'expo-asset';
import type { RootStackParamList } from '../navigation/types';
import { analyzeReceiptImage } from '../services/azureOcr';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

const ScanScreen: React.FC<Props> = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            if (!permission?.granted) await requestPermission?.();
        })();
    }, [permission, requestPermission]);

    if (!permission) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Checking camera permission…</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Camera access is required.</Text>
                <Pressable onPress={() => requestPermission?.()}>
                    <Text>Grant Permission</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const handleCapture = async () => {
        if (isProcessing || !cameraRef.current) return;
        try {
            setIsProcessing(true);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            const ocr = await analyzeReceiptImage(photo.uri);
            navigation.replace('ReceiptDetails', {
                imageUri: photo.uri,
                merchant: ocr.merchant,
                date: ocr.date,
                total: ocr.total ?? null,
                confidence: ocr.confidence ?? null,
            });
        } catch (e) {
            console.error('Capture/OCR error', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUseSample = async () => {
        if (isProcessing) return;
        try {
            setIsProcessing(true);
            // Bundled asset (no internet required to load the file)
            const asset = Asset.fromModule(require('../../assets/sample-receipt.jpg'));
            await asset.downloadAsync();
            const localUri = asset.localUri ?? asset.uri;

            const ocr = await analyzeReceiptImage(localUri);
            navigation.replace('ReceiptDetails', {
                imageUri: localUri,
                merchant: ocr.merchant,
                date: ocr.date,
                total: ocr.total ?? null,
                confidence: ocr.confidence ?? null,
            });
        } catch (e) {
            console.error('Sample load/OCR error', e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>{'<'}</Text>
                </Pressable>
                <Text style={styles.title}>Scan Receipt</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Camera */}
            <View style={styles.cameraWrap}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
                <View style={styles.viewfinder} pointerEvents="none" />
            </View>

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
                {isProcessing ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <Pressable style={styles.shutter} onPress={handleCapture} />
                        <Pressable style={{ marginTop: 16 }} onPress={handleUseSample}>
                            <Text>Use Sample Receipt</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 56, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 16,
    },
    back: { fontSize: 20 },
    title: {},
    cameraWrap: { flex: 1, margin: 16, borderRadius: 16, overflow: 'hidden' },
    viewfinder: {
        position: 'absolute', top: '10%', left: '5%', right: '5%', bottom: '10%',
        borderWidth: 2, borderRadius: 16,
    },
    bottomBar: { height: 120, justifyContent: 'center', alignItems: 'center' },
    shutter: { width: 70, height: 70, borderRadius: 35, borderWidth: 4 },
});

export default ScanScreen;
