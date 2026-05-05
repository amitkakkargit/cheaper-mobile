import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ProductWithSeller } from '@/lib/types';
import RatingStars from './RatingStars';

interface ProductCardProps {
  product: ProductWithSeller;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const images = useMemo(
    () => (product.images?.filter((image) => Boolean(image)) ?? [product.imageUrl]).slice(0, 1),
    [product.imageUrl, product.images],
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image
        source={{ uri: images[0] || 'https://via.placeholder.com/300x200' }}
        style={styles.image}
      />
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <Text style={styles.tag}>{product.condition}</Text>
          <Text style={styles.location}>{product.location}</Text>
        </View>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.subtitle}>{product.sellerName}</Text>
        <View style={styles.ratingRow}>
          <RatingStars rating={product.productRatingAverage} label={`${product.productRatingAverage.toFixed(1)} out of 5`} />
          <Text style={styles.ratingCount}>
            {product.productRatingCount > 0 ? `${product.productRatingCount} reviews` : 'No reviews'}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.currentPrice}</Text>
          <Text style={styles.originalPrice}>₹{product.previousPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#cbd5e1',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tag: {
    color: '#2563eb',
    fontWeight: '700',
  },
  location: {
    color: '#64748b',
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  ratingCount: {
    color: '#64748b',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
});