import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";

export function HandbagCard({ handbag, onPress, onFavoritePress, isFavorite }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: handbag.uri }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>
            {handbag.handbagName}
          </Text>

          <Pressable onPress={onFavoritePress}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={26}
              color={isFavorite ? colors.danger : colors.muted}
            />
          </Pressable>
        </View>

        <Text style={styles.brand}>{handbag.brand}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
          <Text style={styles.sale}>-{formatPercent(handbag.percentOff)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.category}>{handbag.category}</Text>

          <Text style={styles.gender}>
            {handbag.gender ? "👩 Female" : "👨 Male"}
          </Text>
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
  },
  category: {
    color: colors.text,
  },
  gender: {
    fontWeight: "bold",
    color: colors.success,
  },
});
