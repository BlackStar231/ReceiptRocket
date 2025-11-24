import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface Props {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

const TagChip: React.FC<Props> = ({ label, selected, onPress, style }) => {
    return (
        <Pressable style={[styles.chip, selected && styles.chipSelected, style]} onPress={onPress}>
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        marginRight: 8,
        marginTop: 8,
        // backgroundColor, border etc.
    },
    chipSelected: {
        // different background to show selected
    },
    text: {},
    textSelected: {},
});

export default TagChip;