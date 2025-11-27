// src/screens/GameScreen.js
import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NumberGrid from '../components/NumberGrid';
import { Colors, Gradient } from '../theme';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { addHighscore } from '../db/database';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation, route }) {
  const { currentUser } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const { mode = 'classic', gridSize = 4, startTime = 25 } = route?.params || {};

  // classic: timeCS counts up (centiseconds)
  // timeattack: timeLeftCS counts down (centiseconds)
  const [timeCS, setTimeCS] = useState(0);
  const [timeLeftCS, setTimeLeftCS] = useState(startTime * 100);
  const [running, setRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [next, setNext] = useState(1);
  const [seed, setSeed] = useState(0);

  const intervalRef = useRef(null);
  const isTimeAttack = mode === 'timeattack';

  // start/stop interval depending on running & focus
  useEffect(() => {
    if (running && isFocused) {
      intervalRef.current = setInterval(() => {
        if (isTimeAttack) {
          // countdown for time attack
          setTimeLeftCS(prev => {
            const updated = prev - 10;
            if (updated <= 0) {
              // stop and handle time up
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              handleTimeAttackTimeout();
              return 0;
            }
            return updated;
          });
        } else {
          // classic: count up
          setTimeCS(prev => prev + 10);
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, isFocused, isTimeAttack]);

  // ensure timeLeftCS resets when route params change (or on new)
  useEffect(() => {
    setTimeLeftCS(startTime * 100);
  }, [startTime, mode, seed]);

  function startNew() {
    // force NumberGrid remount to reshuffle tiles
    setSeed(s => s + 1);

    setMistakes(0);
    setNext(1);
    if (isTimeAttack) {
      setTimeLeftCS(startTime * 100);
      setTimeCS(0);
    } else {
      setTimeCS(0);
      setTimeLeftCS(startTime * 100); // keep for reference
    }
    setRunning(true);
  }

  function stopRun() {
    setRunning(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function handleTimeAttackTimeout() {
    stopRun();
    Alert.alert("Time's up!", 'You ran out of time. Try again!');
    // per your choice: no save on timeout
  }

  // compute elapsed seconds (rounded to 2 decimals)
  function computeElapsedSeconds() {
    if (isTimeAttack) {
      // elapsed = startTime - (timeLeft)
      const elapsedCS = startTime * 100 - (timeLeftCS || 0);
      return parseFloat((elapsedCS / 100).toFixed(2));
    }
    return parseFloat((timeCS / 100).toFixed(2));
  }

  function clampFinalSecs(s) {
    // don't allow less than 1.00s
    if (s < 1) return 1;
    return s;
  }

  async function finishGameAndSave() {
    stopRun();

    const baseSec = computeElapsedSeconds(); // base elapsed time (includes effect of penalties on timeattack)
    // For classic we also applied +3s on mistake by increasing timeCS earlier (see handleMistake).
    // For timeattack we applied -3s on mistake by reducing timeLeftCS earlier, so elapsed includes penalty.
    let finalSec = baseSec;

    // Clamp to minimum 1.00s
    finalSec = clampFinalSecs(finalSec);

    Alert.alert('Finished!', `Base Time: ${baseSec.toFixed(2)}s\nMistakes: ${mistakes}\nFinal Time: ${finalSec.toFixed(2)}s`);

    try {
      await addHighscore({
        userId: currentUser?.id ?? null,
        player: currentUser?.username ?? 'Guest',
        time: finalSec,
        mistakes,
        mode,
        gridSize,
      });
    } catch (e) {
      console.warn('save score err', e);
    }
  }

  // NumberGrid onCorrect callback
  function handleCorrect({ value, next: oldNext }) {
    const totalNeeded = gridSize * gridSize;
    setNext(prev => prev + 1);

    if (oldNext >= totalNeeded) {
      // player finished
      finishGameAndSave();
    }
  }

  // NumberGrid onMistake callback
  function handleMistake() {
    setMistakes(m => m + 1);

    if (isTimeAttack) {
      // subtract 3 seconds from remaining immediately
      setTimeLeftCS(prev => {
        const updated = prev - 300;
        if (updated <= 0) {
          // if penalty kills the timer, trigger timeout
          // set to 0 then handle timeout
          setTimeout(() => {
            // ensure interval cleared and game over handled
            handleTimeAttackTimeout();
          }, 0);
          return 0;
        }
        return updated;
      });
    } else {
      // Classic: add 3 seconds immediately to elapsed
      setTimeCS(prev => prev + 300);
    }
  }

  const timeDisplay = isTimeAttack
    ? `${(timeLeftCS / 100).toFixed(2)}s`
    : `${(timeCS / 100).toFixed(2)}s`;

  function BackButton() {
    return (
      <TouchableOpacity style={localStyles.back} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}>
        <Text style={localStyles.backText}>‹ Back</Text>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={localStyles.root}>
      <BackButton />

      <View style={localStyles.headerArea}>
        <Text style={localStyles.timerLabel}>{isTimeAttack ? 'Time Left' : 'Time'}</Text>
        <Text style={localStyles.timer}>{timeDisplay}</Text>
      </View>

      <View style={localStyles.infoRow}>
        <View style={localStyles.statCard}>
          <Text style={localStyles.statLabel}>Next</Text>
          <Text style={localStyles.statValue}>{next}</Text>
        </View>

        <View style={localStyles.statCard}>
          <Text style={localStyles.statLabel}>Mistakes</Text>
          <Text style={localStyles.statValue}>{mistakes}</Text>
        </View>

        <View style={localStyles.statCard}>
          <Text style={localStyles.statLabel}>Mode</Text>
          <Text style={localStyles.statValueSmall}>{mode}</Text>
        </View>
      </View>

      <View style={localStyles.gridWrap}>
        <NumberGrid
          key={seed}
          gridSize={gridSize}
          onCorrect={(data) => handleCorrect(data)}
          onMistake={() => handleMistake()}
          disabled={!running}
        />
      </View>

      <View style={localStyles.actions}>
        <TouchableOpacity style={[localStyles.actionBtn, localStyles.primaryBtn]} onPress={() => startNew()} activeOpacity={0.85}>
          <Text style={localStyles.actionText}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[localStyles.actionBtn, localStyles.secondaryBtn]} onPress={() => navigation.navigate('Highscores')} activeOpacity={0.85}>
          <Text style={localStyles.actionText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 12,
    alignItems: 'center',
  },

  back: {
    position: 'absolute',
    left: 10,
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 20,
  },
  backText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },

  headerArea: {
    marginTop: 34,
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  timerLabel: {
    color: '#334155',
    fontSize: 12,
    marginBottom: 4,
  },
  timer: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },

  infoRow: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },

  gridWrap: {
    width: Math.min(width - 36, 520),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },

  actions: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
  },
  actionBtn: {
    flex: 0.48,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  secondaryBtn: {
    backgroundColor: '#374151',
  },
  actionText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
