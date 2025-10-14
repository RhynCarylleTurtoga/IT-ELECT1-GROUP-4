import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker"; // make sure this package is installed

export default function MenuScreen({ onStart }) {
  const [difficulty, setDifficulty] = useState("normal");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NUMBER RUSH</Text>

      <Text style={styles.instructionTitle}>How to Play:</Text>
      <Text style={styles.instructions}>
        Tap the numbers in ascending order before the timer runs out!
        {"\n"}Each level has less time and more numbers.
        {"\n"}Be careful—one wrong tap and it’s Game Over!
      </Text>

      <Text style={styles.label}>Select Difficulty:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={difficulty}
          onValueChange={(value) => setDifficulty(value)}
          style={styles.picker}
          itemStyle={{ fontSize: 18 }}
        >
          <Picker.Item label="Easy" value="easy" />
          <Picker.Item label="Normal" value="normal" />
          <Picker.Item label="Hard" value="hard" />
        </Picker>
      </View>

      <Button
        title={`Start Game (${difficulty.toUpperCase()})`}
        onPress={() => onStart(difficulty)}
      />
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
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 20,
    color: "white",
    marginBottom: 5,
  },
  instructions: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    fontSize: 18,
  },
  pickerContainer: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: 50,
  },
});
