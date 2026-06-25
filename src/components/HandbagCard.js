import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";

export function HandbagCard({
  handbag,
  onPress,
  onFavoritePress,
  isFavorite,
  selectMode,
  isSelected,
  onSelectPress,
  onLongPress,
}) {
  const reviewCount = (handbag.review || []).length;
  const avgRating = reviewCount > 0
    ? (handbag.review.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "0.0";

  const handlePress = () => {
    if (selectMode && onSelectPress) {
      onSelectPress();
    } else if (onPress) {
      onPress();
    }
  };

  const hasDiscount = handbag.percentOff > 0;
  const finalPrice = hasDiscount ? handbag.cost * (1 - handbag.percentOff) : handbag.cost;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.selectedCard,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
      onPress={handlePress}
      onLongPress={onLongPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: handbag.uri }} style={styles.image} />
        
        {/* Floating Discount Tag */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{formatPercent(handbag.percentOff)}</Text>
          </View>
        )}

        {/* Floating Favorite Button */}
        {!selectMode && (
          <Pressable style={styles.favoriteButton} onPress={onFavoritePress}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? colors.danger : colors.text}
            />
          </Pressable>
        )}

        {selectMode && (
          <View style={styles.checkboxOverlay}>
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={24}
              color={isSelected ? colors.primary : colors.white}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {handbag.brand.toUpperCase()}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {handbag.handbagName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>${formatCurrency(finalPrice)}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>${formatCurrency(handbag.cost)}</Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.yellow} />
            <Text style={styles.ratingText}>{avgRating}</Text>
            <Text style={styles.reviewCountText}>({reviewCount})</Text>
          </View>
          
          <Ionicons
            name={handbag.gender ? "woman-outline" : "man-outline"}
            size={14}
            color={colors.muted}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: 6,
    flex: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#F9F9F9",
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.danger,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  discountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkboxOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    padding: 4,
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 18,
    height: 36, // fixed height for two lines of text to align items in grid
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
  },
  reviewCountText: {
    fontSize: 11,
    color: colors.muted,
  },
});
