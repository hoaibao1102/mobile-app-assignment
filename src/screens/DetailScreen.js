import { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { getHandbags } from "../api/handbagApi";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";
import { RatingSummary } from "../components/RatingSummary";

export function DetailScreen({ route, navigation }) {
  const { handbag } = route.params;
  const [favorites, setFavorites] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const loadFavorites = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  useEffect(() => {
    const loadRelated = async () => {
      setRelatedLoading(true);
      try {
        let allBags = route.params?.allHandbags;
        if (!allBags || allBags.length === 0) {
          allBags = await getHandbags();
        }
        const filtered = allBags
          .filter(
            (item) =>
              item.id !== handbag.id &&
              (item.category === handbag.category || item.brand === handbag.brand)
          )
          .slice(0, 6);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Failed to load related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };
    loadRelated();
  }, [handbag.id, route.params?.allHandbags]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const isFavorite = favorites.some((item) => item.id === handbag.id);

  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    let timer;
    if (showSnackbar) {
      timer = setTimeout(() => {
        setShowSnackbar(false);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSnackbar]);

  const handleFavoritePress = async () => {
    let newFavorites;

    if (isFavorite) {
      newFavorites = await removeFavorite(handbag.id);
      setShowSnackbar(false);
    } else {
      newFavorites = await addFavorite(handbag);
      setShowSnackbar(true);
    }

    setFavorites(newFavorites);
  };

  const hasDiscount = handbag.percentOff > 0;
  const finalPrice = hasDiscount ? handbag.cost * (1 - handbag.percentOff) : handbag.cost;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Proportional Image Header Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: handbag.uri }} style={styles.image} />
          
          {/* Floating Favorite heart */}
          <Pressable
            style={({ pressed }) => [
              styles.favoriteButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleFavoritePress}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.danger : colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Breadcrumbs Pathway */}
          <View style={styles.breadcrumbRow}>
            <Pressable
              onPress={() => navigation.navigate("MainTab", { screen: "Home" })}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text style={styles.breadcrumbLink}>BOUTIQUE</Text>
            </Pressable>
            <Text style={styles.breadcrumbDivider}>  /  </Text>
            <Text style={styles.breadcrumbActive}>{handbag.category.toUpperCase()}</Text>
          </View>

          <Text style={styles.brand}>{handbag.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{handbag.handbagName}</Text>

          {/* Luxury Pricing Layout */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${formatCurrency(finalPrice)}</Text>
            {hasDiscount && (
              <View style={styles.discountRow}>
                <Text style={styles.originalPrice}>${formatCurrency(handbag.cost)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{formatPercent(handbag.percentOff)} OFF</Text>
                </View>
              </View>
            )}
          </View>

          {/* Premium Specs Box Layout */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="apps-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Category: </Text>{handbag.category}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Color: </Text>{handbag.color?.join(", ")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Gender: </Text>{handbag.gender ? "Female" : "Male"}
              </Text>
            </View>
          </View>

          {/* Aura AI Styling Card */}
          <View style={styles.aiBanner}>
            <View style={styles.aiBannerHeader}>
              <Ionicons name="sparkles" size={18} color={colors.yellow} />
              <Text style={styles.aiBannerTitle}>AURA STYLE CONSULTANT</Text>
            </View>
            <Text style={styles.aiBannerText}>
              Need styling inspiration? Ask Aura AI for outfit matching suggestions for this handbag.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.aiBannerBtn,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() =>
                navigation.navigate("MainTab", {
                  screen: "Stylist",
                  params: { handbagPrompt: handbag },
                })
              }
            >
              <Text style={styles.aiBannerBtnText}>Consult Stylist</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.white} />
            </Pressable>
          </View>

          {/* Related Products Section */}
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            {relatedLoading ? (
              <View style={styles.relatedLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : relatedProducts.length === 0 ? (
              <Text style={styles.emptyRelated}>No related products found.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedProducts.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.relatedCard,
                      pressed && { opacity: 0.9 },
                    ]}
                    onPress={() => navigation.push("Detail", { handbag: item })}
                  >
                    <Image source={{ uri: item.uri }} style={styles.relatedImage} />
                    <Text style={styles.relatedBrand}>{item.brand.toUpperCase()}</Text>
                    <Text style={styles.relatedName} numberOfLines={1}>
                      {item.handbagName}
                    </Text>
                    <Text style={styles.relatedPrice}>${formatCurrency(item.cost)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Ratings & Comments */}
          <RatingSummary review={handbag.review} />
        </View>
      </ScrollView>

      {/* Custom Snackbar */}
      {showSnackbar && (
        <View style={styles.snackbar}>
          <View style={styles.snackbarContent}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.snackbarText}>Added to favourites</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.snackbarAction,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => {
              setShowSnackbar(false);
              navigation.navigate("MainTab", { screen: "Favorites" });
            }}
          >
            <Text style={styles.snackbarActionText}>Go to Favourites</Text>
          </Pressable>
        </View>
      )}
    </View>
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
  imageContainer: {
    position: "relative",
    backgroundColor: "#F9F9F9",
    width: "100%",
  },
  image: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    padding: 20,
  },
  brand: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    lineHeight: 28,
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 20,
  },
  price: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: colors.danger,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  discountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  infoLabel: {
    fontWeight: "600",
    color: colors.muted,
  },
  relatedSection: {
    marginBottom: 28,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.text,
  },
  relatedLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyRelated: {
    color: colors.muted,
    fontSize: 14,
    fontStyle: "italic",
    paddingVertical: 10,
  },
  relatedScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  relatedCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  relatedImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
  },
  relatedBrand: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  breadcrumbLink: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1.5,
    textDecorationLine: "underline",
  },
  breadcrumbDivider: {
    fontSize: 11,
    color: colors.muted,
  },
  breadcrumbActive: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
    letterSpacing: 1.5,
  },
  aiBanner: {
    backgroundColor: "rgba(24, 24, 27, 0.95)",
    padding: 18,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiBannerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 2,
  },
  aiBannerText: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  aiBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  aiBannerBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  snackbar: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "rgba(28, 28, 30, 0.95)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  snackbarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  snackbarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  snackbarAction: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  snackbarActionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});
