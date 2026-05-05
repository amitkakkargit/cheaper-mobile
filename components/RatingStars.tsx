import { Pressable, StyleSheet, Text, View } from "react-native";

interface RatingStarsProps {
  rating: number;
  label: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const stars = [1, 2, 3, 4, 5];

export default function RatingStars({
  rating,
  label,
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  return (
    <View
      style={styles.ratingRow}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {stars.map((value) => {
        const filled = rating >= value;
        return (
          <Pressable
            key={value}
            onPress={() => interactive && onRatingChange?.(value)}
            disabled={!interactive}
            style={({ pressed }) => [
              styles.starButton,
              interactive && pressed && styles.starPressed,
            ]}
          >
            <Text
              style={[
                styles.star,
                filled ? styles.starFilled : styles.starOutline,
              ]}
            >
              ★
            </Text>
          </Pressable>
        );
      })}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  starButton: {
    padding: 4,
  },
  starPressed: {
    opacity: 0.65,
  },
  star: {
    fontSize: 20,
  },
  starFilled: {
    color: "#f59e0b",
  },
  starOutline: {
    color: "#94a3b8",
  },
  ratingValue: {
    fontSize: 14,
    color: "#334155",
  },
});
