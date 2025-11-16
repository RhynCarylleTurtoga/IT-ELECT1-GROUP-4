// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sha256 } from '../../utils/hash';
import { createUser } from '../../db/database';
import { Colors, Gradient } from '../../theme';

const { width } = Dimensions.get('window');

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
      Alert.alert('Success', 'Account created. Please login.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (e) {
      console.warn('register error', e);
      Alert.alert('Error', e?.message || 'Could not register.');
    }
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Number Rush</Text>
        <Text style={styles.subtitle}>Create an account</Text>
      </View>

      <View style={styles.card}>
        <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
        <TextInput placeholder="Confirm password" value={confirm} onChangeText={setConfirm} style={styles.input} secureTextEntry />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}><Text style={styles.primaryText}>Create account</Text></TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}><Text style={{ color: Colors.primary }}>Already have an account? Login</Text></TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 36, fontWeight: '900', color: Colors.primary },
  subtitle: { color: Colors.muted },

  card: { width: Math.min(width - 40, 520), backgroundColor: Colors.card, borderRadius: 12, padding: 18, alignItems: 'center', elevation: 4 },
  input: { backgroundColor: '#f9fbff', padding: 12, borderRadius: 10, marginTop: 10, width: '100%' },

  primaryBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#fff', fontWeight: '800' },

  link: { marginTop: 12 }
});