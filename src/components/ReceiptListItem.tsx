import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Receipt } from '../types';

interface Props {
    receipt: Receipt;
    onPress: () => void;
    style?: ViewStyle;
}

const ReceiptListItem: React.FC<Props> = ({ receipt, onPress, style }) => {
    return (
        <Pressable style={[styles.container, style]} onPress={onPress}>
            <View style={styles.left}>
                <Text style={styles.merchant}>{receipt.merchant || 'Unknown merchant'}</Text>
                <Text style={styles.meta}>
                    {receipt.date}  ${receipt.total.toFixed(2)}
                </Text>
            </View>
            <View>
                {/* Right-side arrow or category */}
                <Text style={styles.category}>{receipt.category ?? ''}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    left: {},
    merchant: {
        // font styling here
    },
    meta: {
        // secondary text styling
    },
    category: {
        // small text or chip
    },
});

export default ReceiptListItem;
