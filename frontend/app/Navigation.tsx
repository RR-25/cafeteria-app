import React, { useState, createContext } from "react";
import { View, Text, Switch, StyleSheet, SafeAreaView, Button } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./home";
import Index from "./index";
import Setup from "./setup";

// Global Theme Context
export const ThemeContext = createContext({
  dark: true,
  toggleTheme: () => {},
});

type DrawerParamList = {
  Home: undefined;
};

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const [favoritesEnabled, setFavoritesEnabled] = useState(false);
  const { dark, toggleTheme } = React.useContext(ThemeContext);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <SafeAreaView
        style={[
          styles.drawerContainer,
          { backgroundColor: dark ? "#1A1A1A" : "#EEE" },
        ]}
      >
        <Text style={[styles.drawerTitle, { color: dark ? "#FFD54F" : "#FFAA00" }]}>
          Settings
        </Text>

        <View style={styles.option}>
          <Text style={[styles.optionText, { color: dark ? "#fff" : "#000" }]}>
            Dark Theme
          </Text>
          <Switch value={dark} onValueChange={toggleTheme} />
        </View>

        <View style={styles.option}>
          <Text style={[styles.optionText, { color: dark ? "#fff" : "#000" }]}>
            Favorites
          </Text>
          <Switch
            value={favoritesEnabled}
            onValueChange={() => setFavoritesEnabled(!favoritesEnabled)}
          />
        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  );
}

// Drawer Navigator (Home inside drawer)
function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerPosition: "right",
        drawerStyle: { width: "50%" },
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
    </Drawer.Navigator>
  );
}

// Main Navigation
export default function AppNavigation() {
  const [dark, setDark] = useState(true);

  const toggleTheme = () => setDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="Setup" component={Setup} />
          <Stack.Screen name="AppDrawer" component={AppDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 20,
  },
  drawerTitle: {
    fontSize: 22,
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});
