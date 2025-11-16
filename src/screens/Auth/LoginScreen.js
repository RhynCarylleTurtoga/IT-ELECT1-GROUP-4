// src/screens/Auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Switch, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sha256 } from '../../utils/hash';
import { authenticateUser } from '../../db/database';
import { AuthContext } from '../../context/AuthContext';
import { Colors, Gradient } from '../../theme';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const { setCurrentUser } = useContext(AuthContext);

  async function handleLogin() {
    if (!username.trim()) return Alert.alert('Error', 'Please enter username.');
    if (!password) return Alert.alert('Error', 'Please enter password.');

    try {
      const passhash = await sha256(password);
      const user = await authenticateUser({ username: username.trim(), passhash, remember });
      if (user) {
        setCurrentUser({ id: user.id, username: user.username });
        navigation.navigate('Home');
      } else {
        Alert.alert('Invalid', 'Username or password is incorrect.');
      }
    } catch (e) {
      console.warn('login error', e);
      Alert.alert('Error', 'Could not login.');
    }
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Number Rush</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
      </View>

      <View style={styles.card}>
        <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
        <View style={styles.remRow}>
          <Text>Remember me</Text>
          <Switch value={remember} onValueChange={setRemember} />
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}><Text style={styles.primaryText}>Login</Text></TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}><Text style={{ color: Colors.primary }}>Don't have an account? Register</Text></TouchableOpacity>
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
  remRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },

  primaryBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#fff', fontWeight: '800' },

  link: { marginTop: 12 }
});