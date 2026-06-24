import { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { showrooms } from "../data/showrooms";
import { haversineDistance } from "../utils/haversine";
import { colors } from "../constants/colors";

/**
 * Build an HTML page with Leaflet that shows all showroom markers
 * and a blue circle for the user's current location.
 */
function buildMapHtml({ userLat, userLng, showroomsWithDist }) {
    const markersJson = JSON.stringify(
        showroomsWithDist.map((item) => ({
            id: item.showroom.id,
            name: item.showroom.name,
            lat: item.showroom.latitude,
            lng: item.showroom.longitude,
            address: item.showroom.address,
            km: item.distance.km,
            mi: item.distance.mi,
            phone: item.showroom.phone,
            hours: item.showroom.openingHours,
        })),
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    #map { width: 100vw; height: 100vh; }

    /* Pulse animation for user location */
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(2.6); opacity: 0.1; }
      100% { transform: scale(1); opacity: 0.4; }
    }
    .user-location-pulse {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(26, 26, 26, 0.3);
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -11px;
      margin-top: -11px;
      animation: pulse 2s ease-in-out infinite;
      pointer-events: none;
    }
    .user-location-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #1A1A1A;
      border: 2px solid #FFFFFF;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -7px;
      margin-top: -7px;
      box-shadow: 0 0 8px rgba(26, 26, 26, 0.5);
      pointer-events: none;
    }

    /* Glow animation for nearest marker */
    @keyframes nearestGlow {
      0% { box-shadow: 0 0 6px rgba(201, 169, 110, 0.5); }
      50% { box-shadow: 0 0 20px rgba(201, 169, 110, 0.9), 0 0 40px rgba(201, 169, 110, 0.3); }
      100% { box-shadow: 0 0 6px rgba(201, 169, 110, 0.5); }
    }
    .nearest-marker {
      animation: nearestGlow 1.8s ease-in-out infinite;
    }

    .leaflet-popup-content { margin: 8px 12px; font-size: 13px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .leaflet-popup-content strong { font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // ── User's current location with pulse animation ──
    var userIcon = L.divIcon({
      html: '<div class="user-location-pulse"></div><div class="user-location-dot"></div>',
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -12],
    });
    L.marker([${userLat}, ${userLng}], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup('<strong>Your Location</strong>');

    // ── Showroom markers ──
    var showrooms = ${markersJson};

    // Find the nearest showroom
    var minKm = Infinity;
    var nearestIdx = 0;
    showrooms.forEach(function(s, i) {
      if (s.km < minKm) { minKm = s.km; nearestIdx = i; }
    });

    showrooms.forEach(function(s, i) {
      var isNearest = (i === nearestIdx);

      if (isNearest) {
        // --- Nearest marker: gold, glowing, on top ---
        var icon = L.divIcon({
          html: '<div class="nearest-marker" style="background:#C9A96E;color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;border:2.5px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,0.25);">&#9733;</div>',
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22],
        });

        var marker = L.marker([s.lat, s.lng], { icon: icon, zIndexOffset: 900 }).addTo(map);

        var popupHtml = '<strong>' + s.name + '</strong><br/>' +
          s.address + '<br/>' +
          '&#9742; ' + s.phone + '<br/>' +
          '&#128338; ' + s.hours + '<br/>' +
          '<b>' + s.km + ' km</b> from you' +
          '<br/><span style="color:#C9A96E;font-weight:600;">&#9733; Nearest Showroom</span>';
        marker.bindPopup(popupHtml);
      } else {
        // --- Other markers: dark, standard size ---
        var icon = L.divIcon({
          html: '<div style="background:#1A1A1A;color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);">' + (i + 1) + '</div>',
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -16],
        });

        var marker = L.marker([s.lat, s.lng], { icon: icon }).addTo(map);

        var popupHtml = '<strong>' + s.name + '</strong><br/>' +
          s.address + '<br/>' +
          '&#9742; ' + s.phone + '<br/>' +
          '&#128338; ' + s.hours + '<br/>' +
          '<b>' + s.km + ' km</b> from you';
        marker.bindPopup(popupHtml);
      }
    });

    // ── Default view: focus on user + nearest showroom ──
    var nearest = showrooms[nearestIdx];
    var focusPoints = [
      [${userLat}, ${userLng}],
      [nearest.lat, nearest.lng],
    ];
    var bounds = L.latLngBounds(focusPoints);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  </script>
</body>
</html>`;
}

export function ShowroomMapScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showroomsWithDist, setShowroomsWithDist] = useState([]);
    const [selectedShowroom, setSelectedShowroom] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const webViewRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const loadLocation = async () => {
                setLoading(true);
                setErrorMsg(null);

                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== "granted") {
                        setErrorMsg("Location permission denied. Please enable it in Settings.");
                        setLoading(false);
                        return;
                    }

                    // Try multiple strategies to get the device location
                    let loc = null;

                    // Strategy 1: High accuracy GPS — this is what picks up mock locations
                    // set via emulator extended controls
                    try {
                        loc = await Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.High,
                            timeout: 8000,
                        });
                    } catch (_) {
                        // Strategy 2: Low accuracy (network-based, works when Google Play
                        // Services are available)
                        try {
                            loc = await Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.Low,
                                timeout: 5000,
                            });
                        } catch (_2) {
                            // Strategy 3: Last known position from any provider
                            try {
                                const last = await Location.getLastKnownPositionAsync({
                                    maxAge: 120000,
                                });
                                if (last && last.coords) loc = last;
                            } catch (_3) {
                                // Give up
                            }
                        }
                    }

                    if (!loc || !loc.coords) {
                        if (isMounted) {
                            setErrorMsg(
                                "Could not determine your location. Please make sure Location is turned ON in your emulator's system settings (Settings → Location), not just the GPS mock in extended controls.",
                            );
                        }
                        return;
                    }

                    if (!isMounted) return;

                    const { latitude, longitude } = loc.coords;
                    setLocation({ latitude, longitude });

                    // Calculate distances
                    const withDist = showrooms
                        .map((s) => ({
                            showroom: s,
                            distance: haversineDistance(latitude, longitude, s.latitude, s.longitude),
                        }))
                        .sort((a, b) => a.distance.km - b.distance.km);

                    setShowroomsWithDist(withDist);
                    setSelectedShowroom(withDist[0]?.showroom?.id ?? null);
                } catch (err) {
                    if (isMounted) {
                        setErrorMsg(
                            "Could not determine your location. Make sure location is enabled on your device and a GPS mock is set.",
                        );
                    }
                } finally {
                    if (isMounted) setLoading(false);
                }
            };

            loadLocation();

            return () => {
                isMounted = false;
            };
        }, []),
    );

    const handleCallPress = (phone) => {
        Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);
    };

    const handleNavigatePress = (item) => {
        // Open Google Maps with turn-by-turn directions from current location
        const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${item.showroom.latitude},${item.showroom.longitude}&travelmode=driving`;
        Linking.openURL(url);
    };

    const handleShowroomPress = (item) => {
        setSelectedShowroom(item.showroom.id);
        // Tell the WebView to fly to this marker
        webViewRef.current?.injectJavaScript(`
      map.flyTo([${item.showroom.latitude}, ${item.showroom.longitude}], 15, { duration: 1 });
      true;
    `);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.center}>
                <Ionicons name="location-outline" size={56} color={colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
                <Pressable
                    style={styles.retryButton}
                    onPress={async () => {
                        setLoading(true);
                        setErrorMsg(null);

                        const { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== "granted") {
                            setErrorMsg("Location permission denied. Please enable it in Settings.");
                            setLoading(false);
                            return;
                        }

                        // Retry with fallback strategies (same as loadLocation)
                        let loc = null;
                        try {
                            loc = await Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.High,
                                timeout: 8000,
                            });
                        } catch (_) {
                            try {
                                loc = await Location.getCurrentPositionAsync({
                                    accuracy: Location.Accuracy.Low,
                                    timeout: 5000,
                                });
                            } catch (_2) {
                                try {
                                    const last = await Location.getLastKnownPositionAsync({ maxAge: 120000 });
                                    if (last && last.coords) loc = last;
                                } catch (_3) { }
                            }
                        }

                        if (!loc || !loc.coords) {
                            setErrorMsg(
                                "Could not determine your location. Please make sure Location is turned ON in your emulator's system settings (Settings → Location), not just the GPS mock in extended controls.",
                            );
                            setLoading(false);
                            return;
                        }

                        const { latitude, longitude } = loc.coords;
                        setLocation({ latitude, longitude });
                        const withDist = showrooms
                            .map((s) => ({
                                showroom: s,
                                distance: haversineDistance(latitude, longitude, s.latitude, s.longitude),
                            }))
                            .sort((a, b) => a.distance.km - b.distance.km);
                        setShowroomsWithDist(withDist);
                        setSelectedShowroom(withDist[0]?.showroom?.id ?? null);
                        setLoading(false);
                    }}
                >
                    <Ionicons name="refresh" size={18} color={colors.white} />
                    <Text style={styles.retryText}>Retry</Text>
                </Pressable>
            </View>
        );
    }

    const nearest = showroomsWithDist[0];
    const displayedShowrooms = showAll ? showroomsWithDist : showroomsWithDist.slice(0, 1);

    return (
        <View style={styles.container}>
            {/* Map */}
            <View style={styles.mapContainer}>
                {location && (
                    <WebView
                        ref={webViewRef}
                        originWhitelist={["*"]}
                        source={{ html: buildMapHtml({ userLat: location.latitude, userLng: location.longitude, showroomsWithDist }) }}
                        style={styles.webview}
                        scrollEnabled={false}
                        bounces={false}
                        javaScriptEnabled
                        domStorageEnabled
                    />
                )}
            </View>

            {/* Nearest banner with toggle */}
            {nearest && (
                <Pressable
                    style={styles.nearestBanner}
                    onPress={() => setShowAll((prev) => !prev)}
                >
                    <Ionicons name="ribbon" size={18} color={colors.primary} />
                    <Text style={styles.nearestText} numberOfLines={1}>
                        <Text style={styles.nearestLabel}>Nearest: </Text>
                        <Text style={styles.nearestName}>{nearest.showroom.name}</Text>
                    </Text>
                    {showroomsWithDist.length > 1 && (
                        <View style={styles.viewAllInline}>
                            <Text style={styles.viewAllText}>
                                {showAll ? "Show less" : `View all ${showroomsWithDist.length}`}
                            </Text>
                            <Ionicons
                                name={showAll ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={colors.primary}
                            />
                        </View>
                    )}
                </Pressable>
            )}

            {/* Showroom list */}
            <FlatList
                data={displayedShowrooms}
                keyExtractor={(item) => item.showroom.id}
                style={showAll ? styles.listExpanded : styles.listCollapsed}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={showAll}
                renderItem={({ item, index }) => {
                    const isSelected = selectedShowroom === item.showroom.id;
                    const isNearest = index === 0;

                    return (
                        <Pressable
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => handleShowroomPress(item)}
                        >
                            <View style={styles.cardLeft}>
                                <View
                                    style={[
                                        styles.rankBadge,
                                        isNearest && styles.rankBadgeNearest,
                                    ]}
                                >
                                    <Text style={[styles.rankText, isNearest && styles.rankTextNearest]}>
                                        {index + 1}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.cardName}>{item.showroom.name}</Text>
                                <Text style={styles.cardAddress} numberOfLines={2}>
                                    {item.showroom.address}
                                </Text>
                                <View style={styles.cardMeta}>
                                    <Text style={styles.cardDistance}>
                                        <Ionicons name="location-sharp" size={13} color={colors.primary} />{" "}
                                        {item.distance.km} km
                                    </Text>
                                    <Text style={styles.cardHours}>{item.showroom.openingHours}</Text>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <Pressable
                                    style={styles.navigateButton}
                                    onPress={() => handleNavigatePress(item)}
                                >
                                    <Ionicons name="navigate" size={20} color={colors.white} />
                                </Pressable>
                                <Pressable
                                    style={styles.callButton}
                                    onPress={() => handleCallPress(item.showroom.phone)}
                                >
                                    <Ionicons name="call" size={20} color={"#7CB89B"} />
                                </Pressable>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: 24,
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
        color: colors.muted,
        marginTop: 8,
    },
    errorText: {
        fontSize: 15,
        color: colors.danger,
        textAlign: "center",
        lineHeight: 22,
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 22,
        gap: 6,
        marginTop: 8,
    },
    retryText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    mapContainer: {
        flex: 1,
        minHeight: 200,
        overflow: "hidden",
    },
    webview: {
        flex: 1,
        backgroundColor: "transparent",
    },
    nearestBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    nearestText: {
        fontSize: 13,
        color: colors.text,
        flex: 1,
    },
    nearestLabel: {
        color: colors.muted,
        fontWeight: "500",
    },
    nearestName: {
        fontWeight: "600",
        color: colors.primary,
    },
    viewAllInline: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.secondary,
    },
    listCollapsed: {
        maxHeight: 160,
    },
    listExpanded: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        gap: 10,
        paddingBottom: 24,
    },
    card: {
        flexDirection: "row",
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        gap: 12,
    },
    cardSelected: {
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    cardLeft: {
        alignItems: "center",
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
    },
    rankBadgeNearest: {
        backgroundColor: colors.secondary,
    },
    rankText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
    },
    rankTextNearest: {
        color: colors.white,
    },
    cardBody: {
        flex: 1,
        gap: 4,
    },
    cardName: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        letterSpacing: -0.2,
    },
    cardAddress: {
        fontSize: 12,
        color: colors.muted,
        lineHeight: 16,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 2,
    },
    cardDistance: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: "600",
    },
    cardHours: {
        fontSize: 11,
        color: colors.muted,
    },
    cardActions: {
        flexDirection: "column",
        gap: 8,
    },
    navigateButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    callButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
    },
});
