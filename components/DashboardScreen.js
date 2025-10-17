import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "NumberRushUserData";

export default function DashboardScreen({ currentUser, onBack, onLeaderboard, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadUserScores() {
      setLoading(true);
      if (!currentUser) {
        if (mounted) {
          setScores([]);
          setLoading(false);
        }
        return;
      }

      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        const userData = data[currentUser];

        if (userData && userData.scores && Array.isArray(userData.scores)) {
          const sortedScores = [...userData.scores].sort((a, b) => b.value - a.value);
          if (mounted) setScores(sortedScores);
        } else {
          if (mounted) setScores([]);
        }
      } catch (err) {
        console.warn("Failed to load dashboard scores:", err);
        if (mounted) setScores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUserScores();
    return () => (mounted = false);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No user logged in</Text>
        <TouchableOpacity style={styles.btn} onPress={onBack}>
          <Text style={styles.btnText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {currentUser}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : scores.length === 0 ? (
        <Text style={styles.empty}>No scores yet. Play a game to see your stats!</Text>
      ) : (
        <FlatList
          style={{ width: "100%", marginTop: 12 }}
          data={scores}
          keyExtractor={(item, idx) => `${item.value}-${idx}`}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 1}.</Text>
              <View style={styles.rowRight}>
                <Text style={styles.scoreValue}>{item.value}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.buttonRow}>
        {onLeaderboard && (
          <TouchableOpacity style={styles.btn} onPress={onLeaderboard}>
            <Text style={styles.btnText}>Leaderboard</Text>
          </TouchableOpacity>
        )}

        {onLogout && (
          <TouchableOpacity style={styles.btn} onPress={onLogout}>
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        )}

        {onBack && (
          <TouchableOpacity style={styles.btn} onPress={onBack}>
            <Text style={styles.btnText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#00FFAA", marginBottom: 10 },
  welcome: { color: "#FFD700", marginBottom: 12, fontSize: 16 },
  empty: { color: "#ccc", marginTop: 20, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 8,
    marginVertical: 6,
  },
  rank: { color: "#FFD700", fontWeight: "700", width: 30 },
  rowRight: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  scoreValue: { color: "#00FFA5", fontWeight: "700" },
  date: { color: "#ccc", fontSize: 12 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  btn: {
    backgroundColor: "#222",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 18, marginBottom: 12 },
});
