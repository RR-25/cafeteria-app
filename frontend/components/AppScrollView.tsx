import { ScrollView, ScrollViewProps } from "react-native";

export default function AppScrollView(props: ScrollViewProps) {
  return (
    <ScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}
