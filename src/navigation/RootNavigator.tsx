// src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ReceiptDetailsScreen from '../screens/ReceiptDetailsScreen';
import EditTagsScreen from '../screens/EditTagsScreen';
import ExportScreen from '../screens/ExportScreen';
import { initDb } from '../db/database';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    useEffect(() => {
        (async () => {
            try {
                await initDb();
            } catch (e) {
                console.error('DB init error', e);
            }
        })();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Scan" component={ScanScreen} />
                <Stack.Screen name="ReceiptDetails" component={ReceiptDetailsScreen} />
                <Stack.Screen name="EditTags" component={EditTagsScreen} />
                <Stack.Screen name="Export" component={ExportScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
