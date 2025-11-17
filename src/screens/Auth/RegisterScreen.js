// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sha256 } from '../../utils/hash';
import { createUser } from '../../db/database';
import { Colors, Gradient } from '../../theme';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function handleRegister() {
    if (!username.trim()) return Alert.alert('Error', 'Please enter a username.');
    if (password.length < 4) return Alert.alert('Error', 'Password must be at least 4 characters.');
    if (password !== confirm) return Alert.alert('Error', 'Passwords do not match.');

    try {
      const passhash = await sha256(password);
      await createUser({ username: username.trim(), passhash });
      Alert.alert('Success', 'Account created. Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      console.warn('register error', e);
      Alert.alert('Error', e?.message || 'Could not register.');
    }
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Number Rush</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Password</Text>
            <TextInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Confirm Password</Text>
            <TextInput
              placeholder="Re-enter password"
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkAccent}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Math.max(24, height * 0.06),
    paddingHorizontal: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  subtitle: {
    color: Colors.muted,
    marginTop: 6,
    fontSize: 14,
  },

  card: {
    width: Math.min(width - 40, 520),
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    alignItems: 'stretch',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },

  inputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f9fbff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0,
  },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  link: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: { color: Colors.muted },
  linkAccent: { color: Colors.primary, fontWeight: '700' },
});
