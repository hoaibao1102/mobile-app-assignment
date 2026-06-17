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
    <Animated.View
      style={[styles.container, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: handbag.uri }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name}>{handbag.handbagName}</Text>

            <Pressable onPress={handleFavoritePress}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={32}
                color={isFavorite ? colors.danger : colors.muted}
              />
            </Pressable>
          </View>

          <Text style={styles.brand}>{handbag.brand}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
            <Text style={styles.sale}>-{formatPercent(handbag.percentOff)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.info}>Category: {handbag.category}</Text>
            <Text style={styles.info}>Color: {handbag.color?.join(", ")}</Text>
            <Text style={styles.info}>
              Gender: {handbag.gender ? "Female" : "Male"}
            </Text>
          </View>

          <RatingSummary review={handbag.review} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 330,
    resizeMode: "cover",
    backgroundColor: "#EEE",
  },
  content: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  brand: {
    marginTop: 8,
    fontSize: 16,
    color: colors.muted,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  cost: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  sale: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.danger,
  },
  infoBox: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    fontSize: 15,
    marginBottom: 6,
    color: colors.text,
  },
});
