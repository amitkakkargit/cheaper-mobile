import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import { getSellerById, getSellerRatings, getSellerProducts } from "@/lib/api";
import type { ApiReview, ProductWithSeller, Seller } from "@/lib/types";
import SellerBadge from "@/components/SellerBadge";
import ProductCard from "@/components/ProductCard";

export default function SellerDetailScreen() {
  const params = useLocalSearchParams() as { id: string };
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const sellerData = await getSellerById(params.id);
        if (!sellerData) {
          return;
        }
        setSeller(sellerData);
        setReviews(await getSellerRatings(params.id));
        setProducts(await getSellerProducts(params.id));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Seller not found.</Text>
      </View>
    );
  }

  const reviewAverage = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SellerBadge seller={seller} />
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>About seller</Text>
        <Text style={styles.detailText}>
          {seller.bio ?? "No bio available."}
        </Text>
        <Text style={styles.detailText}>Located in {seller.location}</Text>
        <Text style={styles.detailText}>
          Rating: {reviewAverage.toFixed(1)} ({reviews.length} reviews)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Products by this seller</Text>
        {products.length ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <Text style={styles.detailText}>No active listings yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Seller reviews</Text>
        {reviews.length ? (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewAuthor}>
                {review.user?.name ?? "Buyer"}
              </Text>
              <Text style={styles.reviewRating}>Rating: {review.rating}/5</Text>
              <Text style={styles.reviewText}>
                {review.comment ?? "No review text."}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.detailText}>No seller reviews yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  section: {
    marginTop: 20,
    gap: 10,
  },
  sectionHeading: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
  },
  detailText: {
    color: "#475569",
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  reviewAuthor: {
    color: "#0f172a",
    fontWeight: "700",
    marginBottom: 6,
  },
  reviewRating: {
    color: "#2563eb",
    marginBottom: 6,
  },
  reviewText: {
    color: "#475569",
    lineHeight: 20,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 16,
  },
});
