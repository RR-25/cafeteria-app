import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AppScrollView from "../components/AppScrollView";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Setup() {
  const [block, setBlock] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const router = useRouter();

  const floorMap: Record<string, string[]> = {
    "WB-II": [
      "1st Floor", "2nd Floor", "3rd Floor",
      "4th Floor", "5th Floor", "6th Floor",
      "7th Floor", "8th Floor",
    ],
    "WB-IV": [
      "1st Floor", "2nd Floor", "3rd Floor",
      "4th Floor", "5th Floor", "6th Floor",
      "7th Floor", "8th Floor",
    ],
    "EB-II": [
      "Grd Floor", "1st Floor", "2nd Floor",
      "3rd Floor", "4th Floor",
    ],
  };

  const handleSave = async () => {
    if (!block || !floor) {
      Alert.alert("Incomplete Setup", "Please select both block and floor");
      return;
    }

    await AsyncStorage.setItem(
      "userSetup",
      JSON.stringify({ block, floor })
    );

    router.replace("/home");
  };

  return (
    <AppScrollView
      style={{ flex: 1, backgroundColor: "#0E0E0E" }}
      contentContainerStyle={{ padding: 16 }}
    >
      <View style={{ flex: 1, backgroundColor: "#0E0E0E", padding: 24 }}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>
          Welcome! Let’s set things up
        </Text>

        {/* BLOCK */}
        <Text style={{ color: "#aaa", marginTop: 30 }}>Which block?</Text>

        {["WB-II", "WB-IV", "EB-II"].map(b => (
          <TouchableOpacity
            key={b}
            onPress={() => {
              setBlock(b);
              setFloor(null); // reset floor when block changes
            }}
            style={{
              padding: 16,
              backgroundColor: block === b ? "#FFD54F" : "#1C1C1C",
              borderRadius: 14,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white" }}>{b}</Text>
          </TouchableOpacity>
        ))}

        {/* FLOOR */}
        {block && (
          <>
            <Text style={{ color: "#aaa", marginTop: 30 }}>Which floor?</Text>

            {floorMap[block].map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFloor(f)}
                style={{
                  padding: 16,
                  backgroundColor: floor === f ? "#FFD54F" : "#1C1C1C",
                  borderRadius: 14,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white" }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* SAVE */}
        <TouchableOpacity
          disabled={!block || !floor}
          onPress={handleSave}
          style={{
            marginTop: 40,
            backgroundColor: "#FFD54F",
            padding: 16,
            borderRadius: 30,
            alignItems: "center",
            opacity: block && floor ? 1 : 0.5,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Let’s Go →
          </Text>
        </TouchableOpacity>
      </View>
    </AppScrollView>
  );
}
