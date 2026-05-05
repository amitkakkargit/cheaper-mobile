import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import {
  getTransactionStatus,
  getCurrentUser,
  getProductById,
  getProductRatings,
  getSellerRatings,
} from "@/lib/api";
import type {
  ApiReview,
  CurrentUser,
  ProductWithSeller,
  TransactionStatus,
} from "@/lib/types";
import { buildFallbackTransactionStatus } from "@/lib/transactionRules";
import ImageCarousel from "@/components/ImageCarousel";
import RatingStars from "@/components/RatingStars";
import FormNotification, {
  type NotificationState,
} from "@/components/FormNotification";
import SellerBadge from "@/components/SellerBadge";
import TransactionActions from "@/components/TransactionActions";

export default function ProductDetailScreen() {
  const params = useLocalSearchParams() as { id: string };
  const [product, setProduct] = useState<ProductWithSeller | null>(null);
  const [productReviews, setProductReviews] = useState<ApiReview[]>([]);
  const [sellerReviews, setSellerReviews] = useState<ApiReview[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [loading, setLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setProduct(null);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const productData = await getProductById(params.id);
      if (!productData) {
        setNotification({ type: "error", message: "Product not found" });
        return;
      }
      setProduct(productData);
      setProductReviews(await getProductRatings(params.id));
      setSellerReviews(await getSellerRatings(productData.sellerId));
      if (currentUser) {
        setTransactionLoading(true);
        try {
          setTransactionStatus(await getTransactionStatus(params.id));
        } catch {
          setTransactionStatus(
            buildFallbackTransactionStatus(productData, currentUser),
          );
        } finally {
          setTransactionLoading(false);
        }
      } else {
        setTransactionStatus(null);
      }
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to load product",
      });
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const visibleProductRatingAverage = productReviews.length
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
      productReviews.length
    : 0;
  const visibleSellerRatingAverage = sellerReviews.length
    ? sellerReviews.reduce((sum, review) => sum + review.rating, 0) /
      sellerReviews.length
    : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.subtitle}>{product.location}</Text>
        <ImageCarousel
          images={product.images ?? [product.imageUrl]}
          alt={product.title}
        />
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.currentPrice}</Text>
            <Text style={styles.originalPrice}>₹{product.previousPrice}</Text>
          </View>
          <Text style={styles.detailText}>{product.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Product rating</Text>
          <RatingStars
            rating={visibleProductRatingAverage}
            label={`${visibleProductRatingAverage.toFixed(1)} out of 5`}
          />
          <Text style={styles.reviewCount}>
            {productReviews.length} product reviews
          </Text>
          <Text style={styles.sectionHeading}>Seller rating</Text>
          <RatingStars
            rating={visibleSellerRatingAverage}
            label={`${visibleSellerRatingAverage.toFixed(1)} out of 5`}
          />
          <Text style={styles.reviewCount}>
            {sellerReviews.length} seller ratings
          </Text>
        </View>

        {product.seller ? <SellerBadge seller={product.seller} /> : null}

        <TransactionActions
          product={product}
          user={user}
          status={transactionStatus}
          loading={transactionLoading}
          onRefresh={loadProduct}
          onNotify={(type, message) => setNotification({ type, message })}
        />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Product reviews</Text>
          {productReviews.length ? (
            productReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewAuthor}>
                  {review.user?.name ?? "Buyer"}
                </Text>
                <Text style={styles.reviewRating}>
                  Rating: {review.rating}/5
                </Text>
                <Text style={styles.reviewText}>
                  {review.comment ?? "No comment provided."}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailText}>
              No product reviews available yet.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Seller reviews</Text>
          {sellerReviews.length ? (
            sellerReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewAuthor}>
                  {review.user?.name ?? "Buyer"}
                </Text>
                <Text style={styles.reviewRating}>
                  Rating: {review.rating}/5
                </Text>
                <Text style={styles.reviewText}>
                  {review.comment ?? "No comment provided."}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailText}>
              No seller reviews available yet.
            </Text>
          )}
        </View>

        <FormNotification notification={notification} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#475569",
    marginBottom: 16,
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
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  originalPrice: {
    fontSize: 16,
    color: "#64748b",
    textDecorationLine: "line-through",
  },
  reviewCount: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
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
