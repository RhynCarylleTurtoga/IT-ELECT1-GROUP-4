import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker"; // make sure this package is installed

export default function MenuScreen({ onStart }) {
  const [difficulty, setDifficulty] = useState("normal");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NUMBER RUSH</Text>

      <Text style={styles.instructionTitle}>HOW TO PLAY</Text>
      <Text style={styles.instructions}>
        Tap the numbers in ascending order before the timer runs out!
        {"\n"}Each level has less time and more numbers.
        {"\n"}Be careful—one wrong tap and it’s Game Over!
      </Text>

      <Text style={styles.label}>SELECT DIFFICULTY</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={difficulty}
          onValueChange={(value) => setDifficulty(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#00FFAA"
        >
          <Picker.Item label="Easy" value="easy" />
          <Picker.Item label="Normal" value="normal" />
          <Picker.Item label="Hard" value="hard" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onStart(difficulty)}
        activeOpacity={0.7}
      >
        <Text style={styles.startButtonText}>
          START GAME ({difficulty.toUpperCase()})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#00FFAA",
    marginBottom: 40,
    textShadowColor: "rgba(0, 255, 170, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    letterSpacing: 1,
  },
  instructions: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    fontSize: 16,
  },
  label: {
    color: "#fff",
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  pickerContainer: {
    width: "80%",
    height: 50,
    backgroundColor: "#1A242D",
    borderRadius: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#00FFAA",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: 50,
    color: "#FFFFFF",
  },
  pickerItem: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  startButton: {
    backgroundColor: "#00FFAA",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  startButtonText: {
    color: "#101820",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
