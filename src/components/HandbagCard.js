import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";

function calcAvgRating(review = []) {
  if (review.length === 0) return 0;
  const sum = review.reduce((acc, r) => acc + r.rating, 0);
  return (sum / review.length).toFixed(1);
}

function renderStars(rating) {
  const rounded = Math.round(Number(rating));
  const full = Math.min(rounded, 5);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

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
  const avgRating = calcAvgRating(handbag.review);

  const handlePress = () => {
    if (selectMode && onSelectPress) {
      onSelectPress();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={handlePress}
      onLongPress={onLongPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: handbag.uri }} style={styles.image} />
        {handbag.percentOff > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{formatPercent(handbag.percentOff)}</Text>
          </View>
        )}
        {selectMode && (
          <View style={[styles.checkboxBadge, isSelected && styles.checkboxBadgeActive]}>
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={22}
              color={isSelected ? "#DC2626" : colors.muted}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.brand}>{handbag.brand}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {handbag.handbagName}
            </Text>
          </View>

          {!selectMode && (
            <Pressable onPress={onFavoritePress} style={styles.favBtn}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? colors.secondary : colors.muted}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.costRow}>
            <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
            <View style={styles.genderBadge}>
              <Ionicons
                name={handbag.gender ? "woman-outline" : "man-outline"}
                size={12}
                color={colors.muted}
              />
              <Text style={styles.genderText}>
                {handbag.gender ? "Women" : "Men"}
              </Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(Number(avgRating))}</Text>
            <Text style={styles.ratingText}>{avgRating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: "#DC2626",
    borderWidth: 1.5,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 240,
    resizeMode: "cover",
    backgroundColor: "#F0F0F0",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  checkboxBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBadgeActive: {
    backgroundColor: "rgba(220, 38, 38, 0.15)",
  },
  content: {
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: -0.2,
  },
  brand: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  favBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cost: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  genderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.overlay,
  },
  genderText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stars: {
    fontSize: 12,
    color: colors.secondary,
    letterSpacing: 1,
  },
  ratingText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "500",
  },
});
