export type ConditionType = 'New' | 'Second-hand' | 'Used' | 'Refurbished';

export interface Product {
  id: string;
  name?: string;
  title: string;
  description: string;
  imageUrl: string;
  images?: string[];
  videoUrl: string;
  videoStory: string;
  currentPrice: number;
  previousPrice: number;
  discountPercentage: number;
  condition: ConditionType;
  location: string;
  category: string;
  sellerId: string;
  latitude?: number;
  longitude?: number;
  seller?: Seller;
  reviews?: ApiReview[];
}

export interface Seller {
  id: string;
  userId?: string;
  name: string;
  location: string;
  bio: string;
  avatarUrl: string;
  latitude?: number;
  longitude?: number;
  products?: Product[];
  reviews?: ApiReview[];
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export interface ApiReview {
  id: string;
  userId: string;
  sellerId?: string;
  productId?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  user?: {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
}

export interface ProductWithSeller extends Product {
  sellerName: string;
  sellerLocation: string;
  sellerAvatarUrl: string;
  productRatingCount: number;
  productRatingAverage: number;
  sellerRatingCount: number;
  sellerRatingAverage: number;
}

export interface CurrentUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  sellers?: Array<{ id: string }>;
}
