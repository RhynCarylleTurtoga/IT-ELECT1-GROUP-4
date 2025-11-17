// src/ui/ScreenWrapper.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

/**
 * ScreenWrapper
 * - Use this to wrap screen JSX so you get a consistent header/main/footer look.
 * - It is purely presentational — doesn't change your logic or navigation.
 *
 * Example usage in a screen:
 * import ScreenWrapper from '../ui/ScreenWrapper';
 *
 * function WelcomeScreen(props) {
 *   // ...existing logic unchanged
 *   return (
 *     <ScreenWrapper title="Welcome">
 *       { /* paste your existing screen JSX here *\/ }
 *     </ScreenWrapper>
 *   );
 * }
 */
export default function ScreenWrapper({ title, children, rightComponent }) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{title || 'NumberRush'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {rightComponent ? rightComponent : null}
          </View>
        </View>
      </View>

      <View style={styles.main}>
        {children}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} NumberRush</Text>
      </View>
    </>
  );
}
