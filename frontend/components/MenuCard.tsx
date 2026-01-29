import { View, Text } from "react-native";

interface MenuCardProps {
  title: string;
  time: string;
  items: string[];
}

export default function MenuCard({ title, time, items }: MenuCardProps) {
  return (
    <View
      style={{
        backgroundColor: "#1B1B1B",
        padding: 16,
        borderRadius: 18,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
        {title}
      </Text>

      <Text style={{ color: "#aaa", marginVertical: 4 }}>
        {time}
      </Text>

      <Text style={{ color: "#ddd" }}>
        {items.join(", ")}
      </Text>
    </View>
  );
}
