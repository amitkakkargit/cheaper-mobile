import { Pressable, StyleSheet, Text, View } from "react-native";

interface RatingStarsProps {
  rating: number;
  label: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const stars = [1, 2, 3, 4, 5];
const ratingOptions = Array.from({ length: 10 }, (_, index) => (index + 1) / 2);

export const roundRatingToHalf = (rating: number) =>
  Math.max(0, Math.min(5, Math.round(rating * 2) / 2));

const getFillPercent = (rating: number, star: number) => {
  const rounded = roundRatingToHalf(rating);
  if (rounded >= star) return "100%";
  if (rounded >= star - 0.5) return "50%";
  return "0%";
};

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
      <View style={styles.starVisuals} pointerEvents="none">
        {stars.map((value) => (
          <View key={value} style={styles.starShell}>
            <Text style={[styles.star, styles.starOutline]}>★</Text>
            <View
              style={[
                styles.starFillClip,
                { width: getFillPercent(rating, value) },
              ]}
            >
              <Text style={[styles.star, styles.starFilled]}>★</Text>
            </View>
          </View>
        ))}
      </View>
      {interactive ? (
        <View style={styles.hitGrid}>
          {ratingOptions.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${value.toFixed(1)} out of 5`}
              onPress={() => onRatingChange?.(value)}
              style={({ pressed }) => [
                styles.halfButton,
                pressed && styles.starPressed,
              ]}
            />
          ))}
        </View>
      ) : null}
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
    position: "relative",
  },
  starVisuals: {
    flexDirection: "row",
    gap: 6,
  },
  starShell: {
    width: 20,
    height: 24,
    position: "relative",
  },
  starFillClip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  hitGrid: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 124,
    height: 32,
    flexDirection: "row",
  },
  halfButton: {
    width: 12.4,
    height: 32,
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
