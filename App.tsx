// App.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <RootNavigator />
                <StatusBar style="light" />
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
