import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { colors } from "../constants/colors";

const STORES = [
  {
    id: "fpt-boutique",
    name: "Luxury Boutique - FPT Campus",
    address: "Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Thủ Đức",
    phone: "+84 28 7300 5588",
    hours: "8:30 AM - 9:30 PM",
    latitude: 10.84142,
    longitude: 106.81004,
  }
];

export function StoreLocatorScreen({ navigation }) {
  const [activeStore, setActiveStore] = useState(STORES[0]);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(null); // 'granted', 'denied', or null
  const mapRef = useRef(null);

  useEffect(() => {
    getLocationAsync();
  }, []);

  useEffect(() => {
    if (userLocation && activeStore) {
      fetchRoute(userLocation, activeStore);
    }
  }, [userLocation, activeStore]);

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      fitMapToMarkers(routeCoordinates);
    }
  }, [routeCoordinates]);

  const getLocationAsync = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const requestResult = await Location.requestForegroundPermissionsAsync();
        setPermissionGranted(requestResult.status);
        if (requestResult.status !== "granted") {
          setLocationError("Location permission denied. Enable it in Settings to see directions.");
          setLocationLoading(false);
          return;
        }
      } else {
        setPermissionGranted("granted");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);
    } catch (error) {
      console.error("Error getting location: ", error);
      setLocationError("Could not retrieve your location. Make sure GPS is enabled.");
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchRoute = async (userLoc, storeLoc) => {
    if (!userLoc || !storeLoc) return;
    try {
      const url = `http://router.project-osrm.org/route/v1/driving/${userLoc.longitude},${userLoc.latitude};${storeLoc.longitude},${storeLoc.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setRouteCoordinates(coords);
        } else {
          // Fallback to straight line
          setRouteCoordinates([
            { latitude: userLoc.latitude, longitude: userLoc.longitude },
            { latitude: storeLoc.latitude, longitude: storeLoc.longitude }
          ]);
        }
      } else {
        // Fallback to straight line
        setRouteCoordinates([
          { latitude: userLoc.latitude, longitude: userLoc.longitude },
          { latitude: storeLoc.latitude, longitude: storeLoc.longitude }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
      // Fallback to straight line
      setRouteCoordinates([
        { latitude: userLoc.latitude, longitude: userLoc.longitude },
        { latitude: storeLoc.latitude, longitude: storeLoc.longitude }
      ]);
    }
  };

  const handleOpenSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const fitMapToMarkers = (coordsArray) => {
    if (!mapRef.current || !coordsArray || coordsArray.length === 0) return;
    
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        coordsArray,
        {
          edgePadding: { top: 100, right: 100, bottom: 280, left: 100 },
          animated: true,
        }
      );
    }, 400);
  };

  const handleStorePress = (store) => {
    setActiveStore(store);
    if (routeCoordinates.length > 0) {
      fitMapToMarkers(routeCoordinates);
    } else {
      mapRef.current?.animateToRegion(
        {
          latitude: store.latitude,
          longitude: store.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        600
      );
    }
  };

  const handleGetDirections = (store) => {
    const originStr = userLocation ? `&origin=${userLocation.latitude},${userLocation.longitude}` : "";
    const destStr = `destination=${store.latitude},${store.longitude}`;
    const query = `${destStr}${originStr}`;

    const url = Platform.select({
      ios: userLocation 
        ? `maps://app?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${store.latitude},${store.longitude}` 
        : `maps://app?daddr=${store.latitude},${store.longitude}`,
      android: `google.navigation:q=${store.latitude},${store.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&${query}&travelmode=driving`
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/dir/?api=1&${query}&travelmode=driving`;
          Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error("Linking error:", err);
        Alert.alert("Error", "Unable to open external map application.");
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>STORE LOCATOR</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Location Permission Warning Banner */}
      {locationError && (
        <View style={styles.warningBanner}>
          <View style={styles.warningLeft}>
            <Ionicons name="warning" size={18} color={colors.white} />
            <Text style={styles.warningText} numberOfLines={2}>
              {locationError}
            </Text>
          </View>
          <View style={styles.warningRight}>
            <Pressable 
              style={styles.retryBtn} 
              onPress={permissionGranted === "denied" ? handleOpenSettings : getLocationAsync}
            >
              <Text style={styles.retryBtnText}>
                {permissionGranted === "denied" ? "Settings" : "Retry"}
              </Text>
            </Pressable>
            <Pressable onPress={() => setLocationError(null)} style={styles.closeWarning}>
              <Ionicons name="close" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: activeStore.latitude,
          longitude: activeStore.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
      >
        {/* Store Marker */}
        {STORES.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            title={store.name}
            description={store.address}
            pinColor={colors.primary}
            onPress={() => setActiveStore(store)}
          />
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          >
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerPulse} />
              <View style={styles.userMarkerDot} />
            </View>
          </Marker>
        )}

        {/* Real Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Loading Overlay */}
      {locationLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Locating your device...</Text>
        </View>
      )}

      {/* Snap Store Cards List at the bottom */}
      <View style={styles.storeListContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={Dimensions.get("window").width - 40}
          decelerationRate="fast"
        >
          {STORES.map((store) => {
            const isActive = activeStore.id === store.id;
            return (
              <Pressable
                key={store.id}
                style={[styles.storeCard, isActive && styles.activeCard]}
                onPress={() => handleStorePress(store)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Ionicons
                    name="location"
                    size={18}
                    color={isActive ? colors.danger : colors.muted}
                  />
                </View>
                
                <Text style={styles.storeAddress} numberOfLines={3}>
                  {store.address}
                </Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="call" size={13} color={colors.muted} />
                    <Text style={styles.detailText}>{store.phone}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={13} color={colors.muted} />
                    <Text style={styles.detailText}>{store.hours}</Text>
                  </View>
                </View>

                {/* Get Directions Action Button */}
                {isActive && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.directionsBtn,
                      pressed && { opacity: 0.85 }
                    ]}
                    onPress={() => handleGetDirections(store)}
                  >
                    <Ionicons name="navigate" size={15} color={colors.white} />
                    <Text style={styles.directionsBtnText}>GET DIRECTIONS</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 2,
  },
  map: {
    flex: 1,
  },
  storeListContainer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  storeCard: {
    width: Dimensions.get("window").width - 52,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  storeAddress: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 8,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "500",
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  directionsBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 99,
  },
  warningLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  warningText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  warningRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  retryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  closeWarning: {
    padding: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  userMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  userMarkerPulse: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 122, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.4)",
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
