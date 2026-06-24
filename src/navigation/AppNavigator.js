import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "../screens/HomeScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ShowroomMapScreen } from "../screens/ShowroomMapScreen";
import { colors } from "../constants/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "600", fontSize: 17, letterSpacing: -0.3 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SmartSearch"
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: "", gestureEnabled: true }}
      />
      <Stack.Screen
        name="SearchDetail"
        component={DetailScreen}
        options={{ title: "", gestureEnabled: true }}
      />
      <Stack.Screen
        name="ShowroomMap"
        component={ShowroomMapScreen}
        options={{ title: "Showroom Map" }}
      />
    </Stack.Navigator>
  );
}

function FavoriteStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "600", fontSize: 17, letterSpacing: -0.3 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="FavoriteMain"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FavoriteDetail"
        component={DetailScreen}
        options={{ title: "", gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}

function ShowroomStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "600", fontSize: 17, letterSpacing: -0.3 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ShowroomMain"
        component={ShowroomMapScreen}
        options={{ title: "Showroom Map" }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 0,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Favorites") iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "Showroom") iconName = focused ? "location" : "location-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route);
            if (
              routeName === "Detail" ||
              routeName === "SearchDetail" ||
              routeName === "SmartSearch" ||
              routeName === "ShowroomMap"
            ) {
              return { display: "none" };
            }
            return {
              backgroundColor: colors.white,
              borderTopWidth: 0,
              elevation: 0,
              height: 88,
              paddingTop: 8,
              paddingBottom: 28,
            };
          })(route),
        })}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoriteStack}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route);
            if (routeName === "FavoriteDetail") {
              return { display: "none" };
            }
            return {
              backgroundColor: colors.white,
              borderTopWidth: 0,
              elevation: 0,
              height: 88,
              paddingTop: 8,
              paddingBottom: 28,
            };
          })(route),
        })}
      />
      <Tab.Screen
        name="Showroom"
        component={ShowroomStack}
        options={{
          title: "Showroom",
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 0,
            elevation: 0,
            height: 88,
            paddingTop: 8,
            paddingBottom: 28,
          },
        }}
      />
    </Tab.Navigator>
  );
}
