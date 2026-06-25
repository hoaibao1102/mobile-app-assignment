import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export function RatingSummary({ review = [] }) {
  const total = review.length;
  
  const groups = [5, 4, 3, 2, 1].map((rating) => {
    const count = review.filter((item) => item.rating === rating).length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating Summary</Text>

      <View style={styles.summaryCard}>
        {groups.map((group) => (
          <View key={group.rating} style={styles.row}>
            <Text style={styles.starLabel}>{group.rating} ★</Text>
            <View style={styles.barContainer}>
              <View style={[styles.barActive, { width: `${group.percentage}%` }]} />
            </View>
            <Text style={styles.count}>{group.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.title}>Customer Comments ({total})</Text>

      {review.length === 0 ? (
        <Text style={styles.empty}>No feedback yet.</Text>
      ) : (
        review.map((item, index) => (
          <View key={index} style={styles.commentBox}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentStar}>{"★".repeat(item.rating) + "☆".repeat(5 - item.rating)}</Text>
              <Text style={styles.commentDate}>Verified Buyer</Text>
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
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.text,
  },
  summaryCard: {
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  starLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
    width: 24,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
    overflow: "hidden",
  },
  barActive: {
    height: "100%",
    backgroundColor: colors.yellow,
    borderRadius: 4,
  },
  count: {
    fontSize: 12,
    color: colors.muted,
    width: 16,
    textAlign: "right",
  },
  empty: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  commentBox: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.01)",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentStar: {
    color: colors.yellow,
    fontWeight: "bold",
    fontSize: 12,
  },
  commentDate: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },
  comment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
