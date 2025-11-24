import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Receipt } from '../types';
import { getAllReceipts } from '../db/database';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { exportReceiptsToCsv, shareCsvFile } from '../services/csvExport';

type Props = NativeStackScreenProps<RootStackParamList, 'Export'>;

const ExportScreen: React.FC<Props> = ({ navigation }) => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        getAllReceipts().then((data) => {
            setReceipts(data);
            const total = data.reduce((sum, r) => sum + (r.total || 0), 0);
            setTotalSpent(total);
        });
    }, []);

    const handleExportCsv = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const uri = await exportReceiptsToCsv(receipts);
            Alert.alert('Exported', `CSV saved to ${uri}`);
        } catch (e) {
            console.error('Export error', e);
            Alert.alert('Error', 'Failed to export CSV');
        } finally {
            setIsExporting(false);
        }
    };

    const handleShareCsv = async () => {
        if (isSharing) return; // prevents "Another share request is being processed now"
        setIsSharing(true);
        try {
            const uri = await exportReceiptsToCsv(receipts);
            await shareCsvFile(uri);
        } catch (e) {
            console.error('Share error', e);
            Alert.alert('Error', 'Failed to share CSV');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>{'<'} </Text>
                </Pressable>
                <Text style={styles.headerTitle}>Export Receipts</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Summary card */}
            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total Receipts</Text>
                        <Text style={styles.value}>{receipts.length}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total Spent</Text>
                        <Text style={styles.value}>${totalSpent.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Placeholder filters (Figma) */}
                <View style={styles.filters}>
                    <View style={styles.filterBox}><Text>Month</Text></View>
                    <View style={styles.filterBox}><Text>Category</Text></View>
                </View>
            </View>

            <PrimaryButton
                label={isExporting ? 'Exporting…' : 'Export as CSV'}
                onPress={isExporting ? () => { } : handleExportCsv}
            />
            <SecondaryButton
                label={isSharing ? 'Sharing…' : 'Share'}
                onPress={isSharing ? () => { } : handleShareCsv}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        height: 56, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, justifyContent: 'space-between',
    },
    backArrow: { fontSize: 20 },
    headerTitle: {},
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
    card: { borderRadius: 12, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: {},
    value: {},
    filters: { flexDirection: 'row', marginTop: 16 },
    filterBox: {
        flex: 1, height: 40, borderRadius: 8,
        justifyContent: 'center', paddingHorizontal: 12, marginRight: 8,
    },
});

export default ExportScreen;
