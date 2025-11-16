// src/screens/GameScreen.js
import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NumberGrid from '../components/NumberGrid';
import { Colors, Gradient } from '../theme';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { addHighscore } from '../db/database';

export default function GameScreen({ navigation, route }) {
  const { currentUser } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const { mode = 'classic', gridSize = 4, startTime = 25 } = route?.params || {};

  const [timeCS, setTimeCS] = useState(0);
  const [running, setRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [next, setNext] = useState(1);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && isFocused) {
      intervalRef.current = setInterval(() => {
        setTimeCS(prev => prev + 10);
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { clearInterval(intervalRef.current); intervalRef.current = null; };
  }, [running, isFocused]);

  function startNew() {
    setTimeCS(0);
    setMistakes(0);
    setNext(1);
    setRunning(true);
  }

  function stopRun() {
    setRunning(false);
  }

  async function handleCorrect({ value, next: oldNext }) {
    setNext(prev => prev + 1);
    if (oldNext >= gridSize * gridSize) {
      stopRun();
      const timeSec = (timeCS / 100).toFixed(2);
      Alert.alert('Well done!', `You finished in ${timeSec}s with ${mistakes} mistakes.`);
      try {
        await addHighscore({ userId: currentUser?.id ?? null, player: currentUser?.username ?? 'Guest', time: parseFloat(timeSec), mistakes, mode, gridSize });
      } catch (e) { console.warn('save score err', e); }
    }
  }

  function handleMistake() { setMistakes(m => m + 1); }

  const timeDisplay = `${(timeCS / 100).toFixed(2)}s`;

  function BackButton() {
    return (
      <TouchableOpacity style={styles.back} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <BackButton />
      <View style={styles.timerWrap}>
        <Text style={styles.timer}>{timeDisplay}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={{ marginBottom: 6 }}>Next: {next}</Text>
        <Text>Time: {timeDisplay}</Text>
        <Text>Mistakes: {mistakes}</Text>
      </View>

      <NumberGrid
        gridSize={gridSize}
        onCorrect={(data) => handleCorrect(data)}
        onMistake={() => handleMistake()}
        disabled={!running}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.leftBtn} onPress={() => startNew()}>
          <Text style={styles.btnText}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rightBtn} onPress={() => navigation.navigate('Highscores')}>
          <Text style={styles.btnText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 12, alignItems: 'center' },
  back: { position: 'absolute', left: 12, top: 12, padding: 6 },
  backText: { color: Colors.primary, fontWeight: '700' },

  timerWrap: { marginTop: 34, alignItems: 'center', marginBottom: 10 },
  timer: { fontSize: 36, fontWeight: '900', color: Colors.primary },

  infoCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
    elevation: 3,
  },

  actions: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  leftBtn: {
    flex: 0.48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rightBtn: {
    flex: 0.48,
    backgroundColor: '#444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
});