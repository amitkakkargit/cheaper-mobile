import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Seller } from "@/lib/types";

interface SellerBadgeProps {
  seller: Seller;
}

export default function SellerBadge({ seller }: SellerBadgeProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{
            uri: seller.avatarUrl || "https://via.placeholder.com/120",
          }}
          style={styles.avatar}
        />
        <View style={styles.details}>
          <Text style={styles.label}>Seller</Text>
          <Text style={styles.title}>{seller.name}</Text>
          <Text style={styles.subtitle}>{seller.location}</Text>
        </View>
      </View>
      <Text style={styles.bio}>{seller.bio}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/seller/${seller.id}`)}
      >
        <Text style={styles.buttonText}>View profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#cbd5e1",
  },
  details: {
    flex: 1,
  },
  label: {
    color: "#475569",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  subtitle: {
    color: "#64748b",
    marginTop: 2,
  },
  bio: {
    color: "#334155",
    marginTop: 12,
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
