import { ExpoRoot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ExpoRoot context={require.context("./app")} />
    </View>
  );
}
