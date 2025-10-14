import React from "react";
import { View, StyleSheet } from "react-native";
import MenuScreen from "./MenuScreen";

export default function App() {
  const handleStart = (difficulty) => {
    console.log("Game starting with difficulty:", difficulty);
    // You can later navigate to another screen or start the game here
  };

  return (
    <View style={styles.container}>
      <MenuScreen onStart={handleStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },
});
