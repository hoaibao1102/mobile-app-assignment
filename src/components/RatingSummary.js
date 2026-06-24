import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

function renderStars(number) {
  return "★".repeat(number) + "☆".repeat(5 - number);
}

export function RatingSummary({ review = [] }) {
  const groups = [5, 4, 3, 2, 1].map((rating) => {
    const count = review.filter((item) => item.rating === rating).length;
    return { rating, count };
  });

  const totalReviews = review.length;
  const avgRating =
    totalReviews > 0
      ? (review.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Reviews</Text>
        {totalReviews > 0 && (
          <View style={styles.avgRow}>
            <Text style={styles.avgNumber}>{avgRating}</Text>
            <Text style={styles.avgStars}>{renderStars(Math.round(Number(avgRating)))}</Text>
            <Text style={styles.avgCount}>({totalReviews})</Text>
          </View>
        )}
      </View>

      <View style={styles.barsContainer}>
        {groups.map((group) => (
          <View key={group.rating} style={styles.barRow}>
            <Text style={styles.barLabel}>{group.rating}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: totalReviews > 0 ? `${(group.count / totalReviews) * 100}%` : "0%",
                  },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{group.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {review.length === 0 ? (
        <Text style={styles.empty}>No feedback yet.</Text>
      ) : (
        review.map((item, index) => (
          <View key={index} style={styles.commentBox}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentStars}>{renderStars(item.rating)}</Text>
              <Text style={styles.commentDate}>Verified</Text>
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.3,
  },
  avgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avgNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  avgStars: {
    fontSize: 14,
    color: colors.secondary,
    letterSpacing: 2,
  },
  avgCount: {
    fontSize: 13,
    color: colors.muted,
  },
  barsContainer: {
    gap: 6,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    width: 14,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
  barCount: {
    fontSize: 12,
    color: colors.muted,
    width: 24,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  commentBox: {
    backgroundColor: colors.cardBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentStars: {
    fontSize: 13,
    color: colors.secondary,
    letterSpacing: 2,
  },
  commentDate: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "500",
  },
  comment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
