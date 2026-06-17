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
  const full = Math.floor(rating);
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
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>
            {handbag.handbagName}
          </Text>

          {!selectMode && (
            <Pressable onPress={onFavoritePress}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={26}
                color={isFavorite ? colors.danger : colors.muted}
              />
            </Pressable>
          )}
        </View>

        <Text style={styles.brand}>{handbag.brand}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
          <Text style={styles.sale}>-{formatPercent(handbag.percentOff)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(Number(avgRating))}</Text>
            <Text style={styles.ratingText}>{avgRating}</Text>
          </View>

          <View style={styles.genderRow}>
            <Ionicons
              name={handbag.gender ? "woman-outline" : "man-outline"}
              size={16}
              color={colors.success}
            />
            <Text style={styles.gender}>
              {handbag.gender ? "Female" : "Male"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: "100%",
    height: 210,
    resizeMode: "cover",
    backgroundColor: "#EEE",
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
  brand: {
    marginTop: 6,
    color: colors.muted,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  cost: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  sale: {
    color: colors.danger,
    fontWeight: "bold",
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stars: {
    fontSize: 14,
    color: colors.yellow,
    fontWeight: "bold",
  },
  ratingText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gender: {
    fontWeight: "bold",
    color: colors.success,
    fontSize: 13,
  },
  imageContainer: {
    position: "relative",
  },
  checkboxOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    padding: 4,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
});
