import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";
import { RatingSummary } from "../components/RatingSummary";

const SWIPE_THRESHOLD = 80;

export function DetailScreen({ route }) {
  const { handbag } = route.params;
  const [favorites, setFavorites] = useState([]);
  const navigation = useNavigation();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 10 && Math.abs(gesture.dy) < 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          translateX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: Dimensions.get("window").width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            navigation.goBack();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const loadFavorites = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const isFavorite = favorites.some((item) => item.id === handbag.id);

  const handleFavoritePress = async () => {
    let newFavorites;

    if (isFavorite) {
      newFavorites = await removeFavorite(handbag.id);
    } else {
      newFavorites = await addFavorite(handbag);
    }

    setFavorites(newFavorites);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[styles.container, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: handbag.uri }} style={styles.image} />

          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.brand}>{handbag.brand}</Text>
                <Text style={styles.name}>{handbag.handbagName}</Text>
              </View>

              <Pressable onPress={handleFavoritePress} style={styles.favBtn}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? colors.secondary : colors.muted}
                />
              </Pressable>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
              {handbag.percentOff > 0 && (
                <View style={styles.saleBadge}>
                  <Text style={styles.saleText}>-{formatPercent(handbag.percentOff)}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{handbag.category}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{handbag.color?.join(", ")}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>
                  {handbag.gender ? "Women" : "Men"}
                </Text>
              </View>
            </View>

            <RatingSummary review={handbag.review} />
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
    backgroundColor: "#F0F0F0",
  },
  content: {
    padding: 24,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.5,
  },
  brand: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  cost: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  saleBadge: {
    backgroundColor: colors.overlay,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  saleText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
});
