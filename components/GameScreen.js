import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const STORAGE_KEY = "NumberRushUserData";

export default function GameScreen({ onExit, difficulty, currentUser }) {
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(15);
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [preCountdown, setPreCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [bgColor] = useState(new Animated.Value(1));

  const timerRef = useRef(null);
  const preCountRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      clearTimeout(preCountRef.current);
    };
  }, []);

  // Pre-game countdown
  useEffect(() => {
    if (!mountedRef.current) return;
    if (preCountdown > 0) {
      preCountRef.current = setTimeout(() => setPreCountdown(p => p - 1), 1000);
    } else if (isCountingDown) {
      setIsCountingDown(false);
      startLevel(1, true);
    }
    return () => clearTimeout(preCountRef.current);
  }, [preCountdown]);

  // Game timer
  useEffect(() => {
    if (isCountingDown || gameOver) return;
    if (time <= 0) {
      handleGameOver();
      return;
    }
    timerRef.current = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [time, isCountingDown, gameOver]);

  // Storage helper
  async function saveScore(username, value) {
    if (!username) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      if (!data[username]) data[username] = { password: "", scores: [] };
      data[username].scores = data[username].scores || [];
      data[username].scores.push({ value, date: new Date().toISOString() });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save score:", err);
    }
  }

  function computeTimeForLevel(lvl) {
    switch (difficulty) {
      case "easy": return Math.max(60 - (lvl - 1) * 2, 5);
      case "normal": return Math.max(30 - (lvl - 1) * 2, 5);
      case "hard": return Math.max(15 - (lvl - 1) * 2, 5);
      default: return 15;
    }
  }

  function computeChoicesCount(lvl) {
    return 10 + (lvl - 1) * 2;
  }

  function startLevel(lvl, resetScore = false) {
    clearTimeout(timerRef.current);
    clearTimeout(preCountRef.current);
    setLevel(lvl);
    setTime(computeTimeForLevel(lvl));
    generateNumbers(lvl);
    animateBackground(lvl);
    setPicked([]);
    setGameOver(false);
    if (resetScore) setScore(0);
  }

  function generateNumbers(lvl) {
    const numToPick = 5;
    const totalChoices = computeChoicesCount(lvl);
    const numbers = Array.from({ length: totalChoices }, () => Math.floor(Math.random() * 100) + 1);
    const targets = [...numbers].sort(() => Math.random() - 0.5).slice(0, numToPick).sort((a, b) => a - b);
    setChoices(numbers);
    setTargetNumbers(targets);
    setPicked([]);
  }

  function animateBackground(lvl) {
    Animated.timing(bgColor, {
      toValue: Math.min(Math.max(lvl, 1), 10),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }

  function handlePress(num) {
    if (gameOver || isCountingDown) return;
    const nextTarget = targetNumbers[picked.length];
    if (nextTarget === undefined) return; // safe guard
    if (num === nextTarget) {
      const newPicked = [...picked, num];
      setPicked(newPicked);
      setScore(s => s + 10);

      if (newPicked.length === targetNumbers.length) {
        if (level === 10) handleGameOver();
        else startLevel(level + 1);
      }
    } else handleGameOver();
  }

  async function handleGameOver() {
    if (!mountedRef.current) return;
    clearTimeout(timerRef.current);
    clearTimeout(preCountRef.current);
    setGameOver(true);
    await saveScore(currentUser, score);
  }

  if (gameOver) {
    return (
      <View style={styles.center}>
        <Text style={styles.overText}>GAME OVER</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <TouchableOpacity style={styles.quitButton} onPress={onExit}>
          <Text style={styles.quitText}>Return to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const NUM_COLUMNS = Math.min(4, Math.ceil(Math.sqrt(choices.length || 10)));
  const buttonSize = (width - NUM_COLUMNS * 20) / NUM_COLUMNS;
  const bgInterpolate = bgColor.interpolate({ inputRange: [1, 10], outputRange: ["#1E90FF", "#FF4500"] });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgInterpolate }]}>
      {isCountingDown ? (
        <View style={styles.center}>
          <Text style={styles.countdownText}>{preCountdown > 0 ? preCountdown : "GO!"}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.header}>Level {level}</Text>
          <Text style={styles.timer}>⏱ {time}s</Text>
          <Text style={styles.scoreText}>⭐ {score}</Text>

          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>Arrange:</Text>
            <Text style={{ color: "yellow", fontSize: 22, textAlign: "center" }}>
              {targetNumbers.join(", ")}
            </Text>
          </View>

          <View style={styles.grid}>
            {choices.map((num, index) => (
              <TouchableOpacity
                key={`${index}-${num}`}
                style={[
                  styles.numButton,
                  { width: buttonSize, height: buttonSize },
                  picked.includes(num) && styles.numPicked,
                ]}
                onPress={() => handlePress(num)}
              >
                <Text style={styles.numText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.quitButton, { width: width * 0.9 }]} onPress={handleGameOver}>
            <Text style={styles.quitText}>QUIT</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  numButton: { backgroundColor: "#333", margin: 8, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  numPicked: { backgroundColor: "green" },
  numText: { color: "white", fontSize: 26, fontWeight: "bold" },
  header: { fontSize: 28, fontWeight: "bold", color: "white" },
  timer: { color: "white", fontSize: 20, marginVertical: 5 },
  countdownText: { color: "white", fontSize: 80, fontWeight: "bold" },
  overText: { fontSize: 40, color: "red", fontWeight: "bold" },
  scoreText: { fontSize: 22, color: "#FFD700", marginVertical: 5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  quitButton: { marginTop: 20, backgroundColor: "red", paddingVertical: 15, borderRadius: 10, alignItems: "center" },
  quitText: { color: "white", fontSize: 20, fontWeight: "bold" },
});
