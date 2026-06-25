import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "../screens/HomeScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { AiStylistScreen } from "../screens/AiStylistScreen";
import { StoreLocatorScreen } from "../screens/StoreLocatorScreen";
import { colors } from "../constants/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Stylist") iconName = "sparkles";
          else if (route.name === "Favorites") iconName = "heart";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Handbags", headerShown: true }}
      />
      <Tab.Screen
        name="Stylist"
        component={AiStylistScreen}
        options={{ title: "AI Stylist", headerShown: false }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Favorites", headerShown: true }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTab"
        component={MainTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SmartSearch"
        component={SearchScreen}
        options={{ title: "Smart Search" }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ navigation }) => ({
          title: "Handbag Detail",
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="SearchDetail"
        component={DetailScreen}
        options={({ navigation }) => ({
          title: "Handbag Detail",
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="FavoriteDetail"
        component={DetailScreen}
        options={({ navigation }) => ({
          title: "Handbag Detail",
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="StoreLocator"
        component={StoreLocatorScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
