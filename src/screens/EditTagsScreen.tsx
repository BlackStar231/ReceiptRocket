import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ReceiptCategory } from '../types';
import TagChip from '../components/TagChip';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTags'>;

const categories: ReceiptCategory[] = ['Food', 'Travel', 'Office', 'Misc'];

const EditTagsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { category: initialCategory, notes: initialNotes, onSave } = route.params;

    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
    const [notes, setNotes] = useState(initialNotes ?? '');

    const handleSave = () => {
        onSave?.(selectedCategory, notes);
        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>{'<'} </Text>
                </Pressable>
                <Text style={styles.headerTitle}>Add Tags / Edit</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.chipRow}>
                        {categories.map((cat) => (
                            <TagChip
                                key={cat}
                                label={cat}
                                selected={selectedCategory === cat}
                                onPress={() => setSelectedCategory(cat)}
                            />
                        ))}
                    </View>

                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notes"
                        multiline
                    />
                </View>
            </View>

            <PrimaryButton label="Save Changes" onPress={handleSave} />
            <SecondaryButton label="Cancel" onPress={handleCancel} />
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
    backArrow: {
        fontSize: 20,
    },
    headerTitle: {},
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    card: {
        borderRadius: 12,
        padding: 16,
    },
    label: {
        marginTop: 8,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    input: {
        marginTop: 4,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
});

export default EditTagsScreen;
