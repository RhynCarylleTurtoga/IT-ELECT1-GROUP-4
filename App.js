// App.js
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import UsersScreen from './src/screens/Admin/UsersScreen';
import HighscoreScreen from './src/screens/HighscoreScreen';

import styles from './src/ui/styles';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      {/* Safe area + status bar only — keeps the navigation and screens exactly as before */}
      <SafeAreaView style={styles.appShell}>
        <StatusBar barStyle="light-content" backgroundColor="#0d6efd" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Highscores" component={HighscoreScreen} />
            <Stack.Screen name="Users" component={UsersScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}
