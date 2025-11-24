// src/screens/ReceiptDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getReceiptById, insertReceipt, updateReceipt } from '../db/database';
import type { Receipt, ReceiptCategory } from '../types';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptDetails'>;

const ReceiptDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { receiptId, imageUri, merchant: ocrMerchant, date: ocrDate, total: ocrTotal, confidence } = route.params ?? {};

    const [merchant, setMerchant] = useState('');
    const [date, setDate] = useState('');
    const [total, setTotal] = useState('');
    const [category, setCategory] = useState<ReceiptCategory | null>(null);
    const [notes, setNotes] = useState('');
    const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

    const isEditingExisting = typeof receiptId === 'number';

    useEffect(() => {
        if (isEditingExisting && receiptId !== undefined) {
            getReceiptById(receiptId).then((rec: Receipt | null) => {
                if (rec) {
                    setMerchant(rec.merchant);
                    setDate(rec.date);
                    setTotal(String(rec.total));
                    setCategory(rec.category);
                    setNotes(rec.notes ?? '');
                    setOcrConfidence(rec.ocrConfidence);
                }
            });
        } else {
            setMerchant(ocrMerchant ?? '');
            setDate(ocrDate ?? '');
            setTotal(ocrTotal != null ? String(ocrTotal) : '');
            setOcrConfidence(confidence ?? null);
        }
    }, [isEditingExisting, receiptId, ocrMerchant, ocrDate, ocrTotal, confidence]);

    const handleSave = async () => {
        const numericTotal = parseFloat(total) || 0;
        if (isEditingExisting && receiptId !== undefined) {
            await updateReceipt(receiptId, merchant, date, numericTotal, category, notes || null);
        } else {
            await insertReceipt(merchant, date, numericTotal, category, notes || null, imageUri ?? null, ocrConfidence);
        }
        navigation.navigate('Home');
    };

    const handleDiscard = () => navigation.navigate('Home');

    const handleEditTags = () => {
        navigation.navigate('EditTags', {
            category,
            notes,
            onSave: (newCategory, newNotes) => {
                setCategory((newCategory as ReceiptCategory) ?? null);
                setNotes(newNotes ?? '');
            },
        });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.backArrow}>{'<'} </Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Receipt Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.label}>Merchant</Text>
                        <TextInput style={styles.input} value={merchant} onChangeText={setMerchant} placeholder="Merchant" />

                        <Text style={styles.label}>Date</Text>
                        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

                        <Text style={styles.label}>Total</Text>
                        <TextInput
                            style={styles.input}
                            value={total}
                            onChangeText={setTotal}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                        />

                        {ocrConfidence != null && (
                            <Text style={styles.confidence}>OCR confidence: {(ocrConfidence * 100).toFixed(0)}%</Text>
                        )}

                        <Pressable onPress={handleEditTags} style={styles.editTagsButton}>
                            <Text style={styles.editTagsText}>Edit tags & notes</Text>
                        </Pressable>
                    </View>
                </View>

                <PrimaryButton label={isEditingExisting ? 'Save Changes' : 'Save Receipt'} onPress={handleSave} />
                <SecondaryButton label="Discard" onPress={handleDiscard} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    backArrow: { fontSize: 20 },
    headerTitle: {},
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
    card: { borderRadius: 12, padding: 16 },
    label: { marginTop: 8 },
    input: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
    confidence: { marginTop: 8 },
    editTagsButton: { marginTop: 16 },
    editTagsText: {},
});

export default ReceiptDetailsScreen;
