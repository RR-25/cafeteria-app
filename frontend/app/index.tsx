import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Welcome() {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem("hasSeenWelcome", "true");
    router.replace("/setup");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0E0E0E",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text style={{ color: "white", fontSize: 34, fontWeight: "700" }}>
        Welcome to{"\n"}EcoServe
      </Text>

      <TouchableOpacity
        onPress={handleStart}
        style={{
          marginTop: 40,
          backgroundColor: "#FFD54F",
          padding: 16,
          borderRadius: 30,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Let’s dive in →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
