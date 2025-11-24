import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface Props {
    label: string;
    onPress: () => void;
    style?: ViewStyle;
}

const PrimaryButton: React.FC<Props> = ({ label, onPress, style }) => {
    return (
        <Pressable style={[styles.button, style]} onPress={onPress}>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        // backgroundColor
    },
    label: {
        // color, font weight, etc
    },
});

export default PrimaryButton;
