// src/screens/HomeScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Colors, Gradient } from '../theme';

const { width } = Dimensions.get('window');

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
      <Text style={styles.title}>Play</Text>

      <View style={styles.diffRow}>
        <Text style={{ marginRight: 8 }}>Difficulty:</Text>
        <TouchableOpacity style={[styles.diffBtn, difficulty === 'easy' && styles.diffSel]} onPress={() => setDifficulty('easy')}><Text>Easy</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.diffBtn, difficulty === 'medium' && styles.diffSel]} onPress={() => setDifficulty('medium')}><Text>Medium</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.diffBtn, difficulty === 'hard' && styles.diffSel]} onPress={() => setDifficulty('hard')}><Text>Hard</Text></TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => requireLoginThenNavigate('Game', { mode: 'classic', gridSize: sel.gridSize, startTime: sel.startTime })}>
          <Text style={styles.primaryText}>Classic Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => requireLoginThenNavigate('Game', { mode: 'timeattack', gridSize: sel.gridSize, startTime: sel.startTime })}>
          <Text style={styles.primaryText}>Time Attack</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.darkBtn]} onPress={() => navigation.navigate('Highscores')}>
          <Text style={styles.darkText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text>Logged in as: <Text style={{ fontWeight: '700' }}>{currentUser ? currentUser.username : 'Guest'}</Text></Text>

        {currentUser ? (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={logout}><Text style={styles.primaryText}>Logout</Text></TouchableOpacity>

            <TouchableOpacity style={[styles.darkBtn]} onPress={() => navigation.navigate('Users')}>
              <Text style={styles.darkText}>Users</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('Welcome')}><Text>Back to Welcome</Text></TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 30 },
  title: { fontSize: 36, fontWeight: '900', color: Colors.primary, marginBottom: 10 },

  diffRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  diffBtn: { padding: 8, marginHorizontal: 6, borderRadius: 10, backgroundColor: '#eee' },
  diffSel: { backgroundColor: '#cfe6ff' },

  card: { width: Math.min(width - 40, 520), paddingVertical: 10, alignItems: 'center' },
  primaryBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '800' },

  darkBtn: { width: '100%', backgroundColor: Colors.darkBtn, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  darkText: { color: '#fff', fontWeight: '800' },

  info: { marginTop: 20, width: Math.min(width - 40, 520), alignItems: 'center' },
  smallBtn: { padding: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 2, marginTop: 8 }
});