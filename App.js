import { StatusBar } from 'expo-status-bar';
import { Image, KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import Comment from './Comment';
import ChatApp from './ChatApp';


export default function App() {
  const [bgColor, setBgColor] = useState('white');

  return (
    <KeyboardAvoidingView
    style= {styles.container}
    behavior={Platform.OS === "android" ? "height" : "padding"}
    >
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ChatApp/>
      <Comment/>
      <Image
      source = {require("./assets/IMG20250916161658.jpg")}
      />
      <StatusBar style="auto" />
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});