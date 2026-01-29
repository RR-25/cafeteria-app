import { View, Text, Switch, StyleSheet, SafeAreaView } from "react-native";
import { useState } from "react";

export default function SettingsScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [favoritesEnabled, setFavoritesEnabled] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkTheme ? "#0E0E0E" : "#fff" }]}>
      <Text style={[styles.title, { color: isDarkTheme ? "#fff" : "#000" }]}>Settings</Text>

      <View style={styles.option}>
        <Text style={[styles.optionText, { color: isDarkTheme ? "#FFD54F" : "#333" }]}>Dark Theme</Text>
        <Switch value={isDarkTheme} onValueChange={setIsDarkTheme} />
      </View>

      <View style={styles.option}>
        <Text style={[styles.optionText, { color: isDarkTheme ? "#FFD54F" : "#333" }]}>Favorites</Text>
        <Switch value={favoritesEnabled} onValueChange={setFavoritesEnabled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
