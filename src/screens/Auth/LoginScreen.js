// src/screens/Auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sha256 } from '../../utils/hash';
import { authenticateUser } from '../../db/database';
import { AuthContext } from '../../context/AuthContext';
import { Colors, Gradient } from '../../theme';

const { width, height } = Dimensions.get('window');

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
            <Text style={styles.subtitle}>Welcome back — login to continue</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              returnKeyType="next"
              autoCorrect={false}
            />

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Password</Text>
            <TextInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              returnKeyType="done"
            />

            <View style={styles.remRow}>
              <View style={styles.remLeft}>
                <Text style={styles.remText}>Remember me</Text>
              </View>
              <Switch
                value={remember}
                onValueChange={setRemember}
                thumbColor={Platform.OS === 'android' ? (remember ? Colors.primary : '#f4f3f4') : undefined}
                trackColor={{ false: '#bfc6d6', true: Colors.primary }}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Register</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.smallMuted}>By logging in you agree to the Terms & Privacy.</Text>
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

  remRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  remLeft: { flexDirection: 'row', alignItems: 'center' },
  remText: { color: Colors.muted },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  link: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: { color: Colors.muted },
  linkAccent: { color: Colors.primary, fontWeight: '700' },

  footerNote: {
    marginTop: 18,
    alignItems: 'center',
  },
  smallMuted: {
    color: Colors.muted,
    fontSize: 12,
  },
});
