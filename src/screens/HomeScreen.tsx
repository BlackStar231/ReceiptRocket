import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Receipt } from '../types';
import { getAllReceipts } from '../db/database';
import ReceiptListItem from '../components/ReceiptListItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);

    const loadReceipts = useCallback(async () => {
        const data = await getAllReceipts();
        setReceipts(data);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadReceipts();
        });
        return unsubscribe;
    }, [navigation, loadReceipts]);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No receipts yet.</Text>
                <Text style={styles.emptySubtitle}>Tap the + button to scan your first receipt.</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* Custom header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ReceiptRocket</Text>
                <Pressable onPress={() => navigation.navigate('Export')}>
                    <Text style={styles.headerAction}>Export</Text>
                </Pressable>
            </View>

            {receipts.length === 0 ? (
                renderEmpty()
            ) : (
                <FlatList
                    data={receipts}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ReceiptListItem
                            receipt={item}
                            onPress={() =>
                                navigation.navigate('ReceiptDetails', {
                                    receiptId: item.id,
                                })
                            }
                        />
                    )}
                />
            )}

            {/* FAB */}
            <Pressable
                style={styles.fab}
                onPress={() => {
                    navigation.navigate('Scan');
                }}
            >
                <Text style={styles.fabLabel}>+</Text>
            </Pressable>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    headerTitle: {
        // font styling
    },
    headerAction: {
        // export text styling
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCard: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderRadius: 12,
        // backgroundColor etc.
    },
    emptyTitle: {
        textAlign: 'center',
    },
    emptySubtitle: {
        marginTop: 8,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor etc.
    },
    fabLabel: {
        fontSize: 28,
    },
});

export default HomeScreen;
