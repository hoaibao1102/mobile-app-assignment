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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating Summary</Text>

      {groups.map((group) => (
        <View key={group.rating} style={styles.row}>
          <Text style={styles.star}>{renderStars(group.rating)}</Text>
          <Text style={styles.count}>{group.count} reviews</Text>
        </View>
      ))}

      <Text style={styles.title}>Comments</Text>

      {review.length === 0 ? (
        <Text style={styles.empty}>No feedback yet.</Text>
      ) : (
        review.map((item, index) => (
          <View key={index} style={styles.commentBox}>
            <Text style={styles.star}>{renderStars(item.rating)}</Text>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  star: {
    color: colors.yellow,
    fontWeight: "bold",
  },
  count: {
    color: colors.muted,
  },
  empty: {
    color: colors.muted,
  },
  commentBox: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comment: {
    marginTop: 6,
    color: colors.text,
  },
});
