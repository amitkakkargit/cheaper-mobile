import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type {
  ApiReview,
  CurrentUser,
  Product,
  ProductWithSeller,
  Seller,
  CreateSupportTicketInput,
  SupportTicketResponse,
  TransactionStatus,
} from './types';

const TOKEN_KEY = 'cheaperAccessToken';
const DEFAULT_API_BASE_URL = 'http://localhost:3001';

function getConfiguredApiBaseUrl() {
  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return hostname === 'localhost' ? DEFAULT_API_BASE_URL : `http://${hostname}:3001`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return DEFAULT_API_BASE_URL;
}

async function getAccessToken() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ?? '';
}

async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearAccessToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getConfiguredApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function enrichProduct(product: Product): ProductWithSeller {
  const seller = product.seller;
  const ratings = Array.isArray(product.reviews) ? product.reviews : [];
  const sellerReviews = Array.isArray(seller?.reviews) ? seller.reviews : [];

  const productRatingAverage =
    ratings.length > 0 ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length : 0;
  const sellerRatingAverage =
    sellerReviews.length > 0
      ? sellerReviews.reduce((sum, review) => sum + review.rating, 0) / sellerReviews.length
      : 0;

  return {
    ...product,
    sellerName: seller?.name ?? 'Unknown seller',
    sellerLocation: seller?.location ?? 'Unknown',
    sellerAvatarUrl: seller?.avatarUrl ?? '',
    productRatingCount: ratings.length,
    productRatingAverage,
    sellerRatingCount: sellerReviews.length,
    sellerRatingAverage,
  };
}

export async function requestPhoneOtp(phone: string) {
  return apiFetch<{ phone: string; otp: string; expiresInSeconds: number }>('/auth/phone/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyPhoneOtp(phone: string, otp: string) {
  const result = await apiFetch<{ accessToken: string }>('/auth/phone/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
  await setAccessToken(result.accessToken);
  return result.accessToken;
}

export async function requestEmailOtp(email: string) {
  return apiFetch<{ email: string; otp: string; expiresInSeconds: number }>('/auth/email/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailOtp(email: string, otp: string) {
  const result = await apiFetch<{ accessToken: string }>('/auth/email/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  await setAccessToken(result.accessToken);
  return result.accessToken;
}

export async function getCurrentUser() {
  try {
    return await apiFetch<CurrentUser>('/auth/me');
  } catch {
    return null;
  }
}

export async function updateProfile(data: { name?: string; avatarUrl?: string }) {
  return apiFetch<CurrentUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function clearUserSession() {
  await clearAccessToken();
}

export async function createSeller(data: {
  name: string;
  location: string;
  bio?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
}) {
  return apiFetch<Seller>('/sellers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createProduct(data: {
  sellerId: string;
  title: string;
  description: string;
  imageUrl?: string;
  currentPrice: number;
  previousPrice: number;
  discountPercentage: number;
  condition: string;
  location: string;
  category: string;
  latitude: number;
  longitude: number;
}) {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAllProducts(): Promise<ProductWithSeller[]> {
  const products = await apiFetch<Array<Product & { seller?: Seller; reviews?: ApiReview[] }>>('/products');
  return products.map(enrichProduct);
}

export async function getProductById(id: string): Promise<ProductWithSeller | null> {
  try {
    const product = await apiFetch<Product & { seller?: Seller; reviews?: ApiReview[] }>(`/products/${encodeURIComponent(id)}`);
    return enrichProduct(product);
  } catch {
    return null;
  }
}

export async function getSellerById(id: string): Promise<Seller | null> {
  try {
    return await apiFetch<Seller>(`/sellers/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export async function getProductsBySeller(sellerId: string): Promise<ProductWithSeller[]> {
  const products = await apiFetch<Array<Product & { seller?: Seller; reviews?: ApiReview[] }>>(
    `/products?sellerId=${encodeURIComponent(sellerId)}`,
  );
  return products.map(enrichProduct);
}

export const getSellerProducts = getProductsBySeller;

export async function getSellerRatings(sellerId: string): Promise<ApiReview[]> {
  return apiFetch<ApiReview[]>(`/seller-reviews/${encodeURIComponent(sellerId)}`);
}

export async function getProductRatings(productId: string): Promise<ApiReview[]> {
  return apiFetch<ApiReview[]>(`/product-reviews/${encodeURIComponent(productId)}`);
}

export async function searchProducts(query: string, location: string): Promise<ProductWithSeller[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('search', query.trim());
  if (location.trim()) params.set('location', location.trim());
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const products = await apiFetch<Array<Product & { seller?: Seller; reviews?: ApiReview[] }>>(
    `/products${suffix}`,
  );
  return products.map(enrichProduct);
}

export async function postProductReview(productId: string, sellerId: string, rating: number, comment: string) {
  return apiFetch('/product-reviews', {
    method: 'POST',
    body: JSON.stringify({ productId, sellerId, rating, comment }),
  });
}

export async function postSellerReview(sellerId: string, productId: string, rating: number, comment: string) {
  return apiFetch('/seller-reviews', {
    method: 'POST',
    body: JSON.stringify({ sellerId, productId, rating, comment }),
  });
}

export async function getTransactionStatus(productId: string) {
  return apiFetch<TransactionStatus>(`/products/${encodeURIComponent(productId)}/transaction-status`);
}

export async function markProductReceived(productId: string) {
  return apiFetch('/products/mark-received', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function markProductSold(productId: string) {
  return apiFetch('/products/mark-sold', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function postBuyerReview(productId: string, buyerId: string, rating: number, comment: string) {
  return apiFetch('/buyer-reviews', {
    method: 'POST',
    body: JSON.stringify({ productId, buyerId, rating, comment }),
  });
}

export const confirmBought = markProductReceived;
export const confirmSold = markProductSold;

export async function createSupportTicket(data: CreateSupportTicketInput) {
  return apiFetch<SupportTicketResponse>('/support-tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
