import React, { useState } from "react";
import { View, Text } from "react-native";
import UserLogin from "./components/UserLogin";
import UserRegistration from "./components/UserRegistration";
import MenuScreen from "./components/MenuScreen";
import DashboardScreen from "./components/DashboardScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import GameScreen from "./components/GameScreen"; // ensure this file exists

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState("login"); // login, register, menu, dashboard, leaderboard, game
  const [difficulty, setDifficulty] = useState("normal");

  function handleLoginSuccess(username) {
    if (!username) return;
    setCurrentUser(username);
    setScreen("menu");
  }

  function handleLogout() {
    setCurrentUser(null);
    setScreen("login");
  }

  function startGame(selectedDifficulty) {
    if (!currentUser) return; // prevent starting game without user
    setDifficulty(selectedDifficulty);
    setScreen("game");
  }

  // Render different screens safely
  switch (screen) {
    case "login":
      return (
        <UserLogin
          onLoginSuccess={handleLoginSuccess}
          onRegister={() => setScreen("register")}
        />
      );

    case "register":
      return (
        <UserRegistration
          onRegistered={() => setScreen("login")}
          onCancel={() => setScreen("login")}
        />
      );

    case "menu":
      if (!currentUser)
        return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>No user logged in</Text>
          </View>
        );

      return (
        <MenuScreen
          currentUser={currentUser}
          onStart={startGame}
          onDashboard={() => setScreen("dashboard")}
          onLeaderboard={() => setScreen("leaderboard")}
          onLogout={handleLogout}
        />
      );

    case "dashboard":
      if (!currentUser) return <Text>No user logged in</Text>;
      return (
        <DashboardScreen
          currentUser={currentUser}
          onBack={() => setScreen("menu")}
          onLeaderboard={() => setScreen("leaderboard")}
          onLogout={handleLogout}
        />
      );

    case "leaderboard":
      return <LeaderboardScreen onBack={() => setScreen("menu")} />;

    case "game":
      if (!currentUser) return <Text>No user logged in</Text>;
      return (
        <GameScreen
          currentUser={currentUser}
          difficulty={difficulty}
          onExit={() => setScreen("menu")}
        />
      );

    default:
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Error: Unknown screen</Text>
        </View>
      );
  }
}
