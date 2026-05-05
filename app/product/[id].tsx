import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import {
  confirmBought,
  confirmSold,
  getCurrentUser,
  getProductById,
  getProductRatings,
  getSellerRatings,
  postProductReview,
  postSellerReview,
} from '@/lib/api';
import type { ApiReview, CurrentUser, ProductWithSeller } from '@/lib/types';
import ImageCarousel from '@/components/ImageCarousel';
import RatingStars from '@/components/RatingStars';
import FormNotification, { type NotificationState } from '@/components/FormNotification';
import SellerBadge from '@/components/SellerBadge';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams() as { id: string };
  const [product, setProduct] = useState<ProductWithSeller | null>(null);
  const [productReviews, setProductReviews] = useState<ApiReview[]>([]);
  const [sellerReviews, setSellerReviews] = useState<ApiReview[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Great purchase with local pickup.');
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
        setNotification({ type: 'error', message: 'Product not found' });
        return;
      }
      setProduct(productData);
      setProductReviews(await getProductRatings(params.id));
      setSellerReviews(await getSellerRatings(productData.sellerId));
    } catch (error) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load product' });
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const userIsSeller = Boolean(user?.sellers?.some((seller) => seller.id === product?.sellerId));

  const visibleProductRatingAverage = productReviews.length
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
    : 0;
  const visibleSellerRatingAverage = sellerReviews.length
    ? sellerReviews.reduce((sum, review) => sum + review.rating, 0) / sellerReviews.length
    : 0;

  const handleAction = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setNotification({ type: 'success', message: success });
      await loadProduct();
    } catch (error) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Action failed' });
    }
  };

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.subtitle}>{product.location}</Text>
        <ImageCarousel images={product.images ?? [product.imageUrl]} alt={product.title} />
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
          <RatingStars rating={visibleProductRatingAverage} label={`${visibleProductRatingAverage.toFixed(1)} out of 5`} />
          <Text style={styles.reviewCount}>{productReviews.length} product reviews</Text>
          <Text style={styles.sectionHeading}>Seller rating</Text>
          <RatingStars rating={visibleSellerRatingAverage} label={`${visibleSellerRatingAverage.toFixed(1)} out of 5`} />
          <Text style={styles.reviewCount}>{sellerReviews.length} seller ratings</Text>
        </View>

        {product.seller ? <SellerBadge seller={product.seller} /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Handoff confirmation</Text>
          <Text style={styles.detailText}>Reviews unlock only after buyer and seller confirm the handoff.</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, (!user || userIsSeller) && styles.disabledButton]}
              onPress={() => handleAction(() => confirmBought(product.id), 'Buyer confirmation saved.')}
              disabled={!user || userIsSeller}
            >
              <Text style={styles.secondaryButtonText}>I got this product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, (!user || !userIsSeller) && styles.disabledButton]}
              onPress={() => handleAction(() => confirmSold(product.id), 'Seller confirmation saved.')}
              disabled={!user || !userIsSeller}
            >
              <Text style={styles.secondaryButtonText}>I sold this product</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Leave a review</Text>
          {user ? (
            <>
              <Text style={styles.label}>Rating</Text>
              <RatingStars rating={rating} label={`Rate this item ${rating} out of 5`} interactive onRatingChange={setRating} />
              <Text style={styles.label}>Comment</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={comment}
                onChangeText={setComment}
                placeholder="Write what you liked about the product or seller."
                placeholderTextColor="#94a3b8"
                multiline
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => handleAction(() => postProductReview(product.id, product.sellerId, rating, comment), 'Product review submitted.')}> 
                  <Text style={styles.primaryButtonText}>Review product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={() => handleAction(() => postSellerReview(product.sellerId, product.id, rating, comment), 'Seller review submitted.')}> 
                  <Text style={styles.primaryButtonText}>Review seller</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.detailText}>Sign in to leave reviews and confirm handoffs.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Product reviews</Text>
          {productReviews.length ? (
            productReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewAuthor}>{review.user?.name ?? 'Buyer'}</Text>
                <Text style={styles.reviewRating}>Rating: {review.rating}/5</Text>
                <Text style={styles.reviewText}>{review.comment ?? 'No comment provided.'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailText}>No product reviews available yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Seller reviews</Text>
          {sellerReviews.length ? (
            sellerReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewAuthor}>{review.user?.name ?? 'Buyer'}</Text>
                <Text style={styles.reviewRating}>Rating: {review.rating}/5</Text>
                <Text style={styles.reviewText}>{review.comment ?? 'No comment provided.'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.detailText}>No seller reviews available yet.</Text>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#475569',
    marginBottom: 16,
  },
  section: {
    marginTop: 20,
    gap: 10,
  },
  sectionHeading: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  detailText: {
    color: '#475569',
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 16,
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  reviewCount: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    color: '#0f172a',
    minHeight: 88,
    marginTop: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  reviewAuthor: {
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 6,
  },
  reviewRating: {
    color: '#2563eb',
    marginBottom: 6,
  },
  reviewText: {
    color: '#475569',
    lineHeight: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
  },
});