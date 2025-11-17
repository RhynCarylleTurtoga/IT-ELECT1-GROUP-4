// src/screens/HomeScreen.js
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Colors, Gradient } from '../theme';

const { width, height } = Dimensions.get('window');

const DIFFICULTY = {
  easy: { gridSize: 3, startTime: 30 },
  medium: { gridSize: 4, startTime: 25 },
  hard: { gridSize: 5, startTime: 20 },
};

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const [difficulty, setDifficulty] = useState('medium');
  const sel = DIFFICULTY[difficulty];

  function requireLoginThenNavigate(route, params) {
    if (!currentUser) return Alert.alert('Login required', 'Please login to play. You can register on the Welcome screen.');
    navigation.navigate(route, params);
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Play</Text>

        <View style={styles.diffCard}>
          <Text style={styles.diffLabel}>Difficulty</Text>
          <View style={styles.diffRow}>
            <TouchableOpacity
              style={[styles.diffBtn, difficulty === 'easy' && styles.diffSel]}
              onPress={() => setDifficulty('easy')}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffText, difficulty === 'easy' && styles.diffTextActive]}>Easy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.diffBtn, difficulty === 'medium' && styles.diffSel]}
              onPress={() => setDifficulty('medium')}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffText, difficulty === 'medium' && styles.diffTextActive]}>Medium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.diffBtn, difficulty === 'hard' && styles.diffSel]}
              onPress={() => setDifficulty('hard')}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffText, difficulty === 'hard' && styles.diffTextActive]}>Hard</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>Grid: {sel.gridSize} × {sel.gridSize} • Start: {sel.startTime}s</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.primaryBtn]}
            onPress={() => requireLoginThenNavigate('Game', { mode: 'classic', gridSize: sel.gridSize, startTime: sel.startTime })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>Classic Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, styles.mt8]}
            onPress={() => requireLoginThenNavigate('Game', { mode: 'timeattack', gridSize: sel.gridSize, startTime: sel.startTime })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>Time Attack</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, styles.mt12]}
            onPress={() => navigation.navigate('Highscores')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Logged in as: <Text style={styles.username}>{currentUser ? currentUser.username : 'Guest'}</Text>
          </Text>

          {currentUser ? (
            <View style={styles.userActions}>
              <TouchableOpacity style={[styles.primaryBtn, styles.smallAction]} onPress={logout} activeOpacity={0.85}>
                <Text style={styles.primaryText}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.secondaryBtn, styles.smallAction]} onPress={() => navigation.navigate('Users')} activeOpacity={0.85}>
                <Text style={styles.secondaryText}>Users</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('Welcome')} activeOpacity={0.8}>
              <Text style={styles.smallBtnText}>Back to Welcome</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    paddingTop: Math.max(28, height * 0.04),
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 14,
  },

  diffCard: {
    width: Math.min(width - 40, 520),
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'stretch',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  diffLabel: {
    color: '#374151',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '700',
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diffBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  diffSel: {
    backgroundColor: '#cfe6ff',
  },
  diffText: {
    color: '#111827',
    fontWeight: '700',
  },
  diffTextActive: {
    color: Colors.primary,
  },
  hint: {
    marginTop: 10,
    color: Colors.muted,
    fontSize: 12,
  },

  card: {
    width: Math.min(width - 40, 520),
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  secondaryBtn: {
    width: '100%',
    backgroundColor: Colors.darkBtn,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },

  info: {
    marginTop: 18,
    width: Math.min(width - 40, 520),
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
  },
  username: {
    fontWeight: '800',
  },

  userActions: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  smallAction: {
    flex: 0.48,
  },

  smallBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.card,
    borderRadius: 10,
    elevation: 2,
  },
  smallBtnText: {
    color: '#111827',
    fontWeight: '700',
  },
});
