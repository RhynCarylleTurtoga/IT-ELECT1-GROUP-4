// src/screens/WelcomeScreen.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Colors, Gradient } from '../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.center}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Title and subtitle */}
          <Text style={styles.title}>Number Rush</Text>
          <Text style={styles.subtitle}>Train speed, sharpen focus</Text>

          {/* NEW: About & Members buttons */}
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              style={[styles.lightBtn, { flex: 0.48 }]}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.lightBtnText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.lightBtn, { flex: 0.48 }]}
              onPress={() => navigation.navigate('Members')}
            >
              <Text style={styles.lightBtnText}>Members</Text>
            </TouchableOpacity>
          </View>

          {currentUser ? (
            <>
              <Text style={styles.welcome}>
                Welcome, <Text style={styles.username}>{currentUser.username}</Text>!
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.primaryBtnText}>Go to Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lightBtn}
                onPress={() => navigation.navigate('Highscores')}
              >
                <Text style={styles.lightBtnText}>Leaderboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkBtn}
                onPress={logout}
              >
                <Text style={styles.linkText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.primaryBtnText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lightBtn}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.lightBtnText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.linkText}>Continue as Guest</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>Simple • Local • Fast</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },

  card: {
    width: Math.min(width - 40, 520),
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 26,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: Colors.muted,
  },

  welcome: {
    fontSize: 18,
    marginBottom: 14,
    color: '#0f172a',
  },

  username: {
    fontWeight: '900',
  },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  lightBtn: {
    width: '100%',
    backgroundColor: '#eef6ff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  lightBtnText: {
    color: Colors.primary,
    fontWeight: '700',
  },

  linkBtn: { marginTop: 12 },
  linkText: { color: Colors.muted },

  footer: {
    marginTop: 10,
    color: '#9aa4b2',
  },
});
