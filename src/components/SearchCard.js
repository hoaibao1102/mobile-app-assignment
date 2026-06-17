import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { getAverageRating } from "../utils/searchUtils";

function renderStars(rating) {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return "★".repeat(full) + "☆".repeat(empty);
}

export function SearchCard({ handbag, onPress, onFavoritePress, isFavorite }) {
    const avgRating = getAverageRating(handbag.review);
    const reviewCount = (handbag.review || []).length;

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image source={{ uri: handbag.uri }} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {handbag.handbagName}
                </Text>

                <Text style={styles.brand}>{handbag.brand}</Text>
                <Text style={styles.category}>{handbag.category}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
                    {handbag.percentOff > 0 && (
                        <Text style={styles.sale}>
                            -{formatPercent(handbag.percentOff)} OFF
                        </Text>
                    )}
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.stars}>{renderStars(avgRating)}</Text>
                    <Text style={styles.ratingText}>
                        {avgRating.toFixed(1)} ({reviewCount}{" "}
                        {reviewCount === 1 ? "review" : "reviews"})
                    </Text>
                </View>
            </View>

            <Pressable style={styles.favoriteBtn} onPress={onFavoritePress}>
                <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={22}
                    color={isFavorite ? colors.danger : colors.muted}
                />
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        position: "relative",
    },
    image: {
        width: 120,
        height: 140,
        resizeMode: "cover",
        backgroundColor: "#EEE",
    },
    content: {
        flex: 1,
        padding: 12,
        paddingRight: 40,
    },
    name: {
        fontSize: 15,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 2,
    },
    brand: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: "600",
        marginBottom: 1,
    },
    category: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    cost: {
        fontSize: 17,
        fontWeight: "bold",
        color: colors.text,
    },
    sale: {
        fontSize: 12,
        fontWeight: "bold",
        color: colors.danger,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
    },
    stars: {
        fontSize: 13,
        color: colors.yellow,
    },
    ratingText: {
        fontSize: 12,
        color: colors.muted,
    },
    favoriteBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        padding: 4,
    },
});
