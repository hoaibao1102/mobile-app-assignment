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
                <View style={styles.topRow}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.brand}>{handbag.brand}</Text>
                        <Text style={styles.name} numberOfLines={1}>
                            {handbag.handbagName}
                        </Text>
                    </View>
                    <Pressable style={styles.favBtn} onPress={onFavoritePress}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={18}
                            color={isFavorite ? colors.secondary : colors.muted}
                        />
                    </Pressable>
                </View>

                <Text style={styles.category}>{handbag.category}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.cost}>{formatCurrency(handbag.cost)}</Text>
                    {handbag.percentOff > 0 && (
                        <View style={styles.saleBadge}>
                            <Text style={styles.saleText}>
                                -{formatPercent(handbag.percentOff)}
                            </Text>
                        </View>
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
    },
    image: {
        width: 120,
        height: 150,
        resizeMode: "cover",
        backgroundColor: "#F0F0F0",
    },
    content: {
        flex: 1,
        padding: 14,
        justifyContent: "space-between",
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    titleBlock: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: colors.text,
        letterSpacing: -0.2,
    },
    brand: {
        fontSize: 10,
        color: colors.muted,
        fontWeight: "600",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    favBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
    },
    category: {
        fontSize: 12,
        color: colors.muted,
        fontWeight: "500",
        marginTop: -4,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 4,
    },
    cost: {
        fontSize: 17,
        fontWeight: "600",
        color: colors.primary,
        letterSpacing: -0.3,
    },
    saleBadge: {
        backgroundColor: colors.overlay,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    saleText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.danger,
        letterSpacing: 0.3,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
    },
    stars: {
        fontSize: 12,
        color: colors.secondary,
        letterSpacing: 1,
    },
    ratingText: {
        fontSize: 11,
        color: colors.muted,
        fontWeight: "500",
    },
});
