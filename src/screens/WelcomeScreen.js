
// src/screens/WelcomeScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Colors, Gradient } from '../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Number Rush</Text>
        <Text style={styles.subtitle}>Train speed, sharpen focus</Text>
      </View>

      <View style={styles.card}>
        {currentUser ? (
          <>
            <Text style={styles.welcome}>Welcome, <Text style={{ fontWeight: '900' }}>{currentUser.username}</Text>!</Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.primaryBtnText}>Go to Play</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.lightBtn} onPress={() => navigation.navigate('Highscores')}>
              <Text style={styles.lightBtnText}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkBtn} onPress={() => { logout(); }}>
              <Text style={styles.linkText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.primaryBtnText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.lightBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.lightBtnText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.linkText}>Continue as Guest</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.small}>Simple • Local • Fast</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 32 },
  header: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 44, fontWeight: '900', color: Colors.primary },
  subtitle: { marginTop: 6, color: Colors.muted },

  card: {
    width: Math.min(width - 40, 520),
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  welcome: { fontSize: 18, marginBottom: 12 },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  lightBtn: {
    width: '100%',
    backgroundColor: '#eef6ff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  lightBtnText: { color: Colors.primary, fontWeight: '700' },

  linkBtn: { marginTop: 12 },
  linkText: { color: Colors.muted },

  footer: { alignItems: 'center', marginBottom: 12 },
  small: { color: '#9aa4b2' }
});