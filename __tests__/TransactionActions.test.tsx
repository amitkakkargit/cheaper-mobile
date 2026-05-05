import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import TransactionActions from '@/components/TransactionActions';
import * as api from '@/lib/api';
import type { CurrentUser, ProductWithSeller, TransactionStatus } from '@/lib/types';

jest.mock('@/components/RatingStars', () => {
  const { Text } = require('react-native');

  return function MockRatingStars({ label }: { label: string }) {
    return <Text>{label}</Text>;
  };
});

jest.mock('@/lib/api', () => ({
  markProductReceived: jest.fn(),
  markProductSold: jest.fn(),
  postBuyerReview: jest.fn(),
  postProductReview: jest.fn(),
  postSellerReview: jest.fn(),
}));

const product: ProductWithSeller = {
  id: 'product-1',
  sellerId: 'seller-1',
  title: 'Used phone',
  description: 'Good phone',
  imageUrl: '',
  images: [],
  videoUrl: '',
  videoStory: '',
  currentPrice: 100,
  previousPrice: 150,
  discountPercentage: 33,
  condition: 'Used',
  location: 'Bengaluru',
  category: 'Electronics',
  sellerName: 'Local seller',
  sellerLocation: 'Bengaluru',
  sellerAvatarUrl: '',
  productRatingCount: 0,
  productRatingAverage: 0,
  sellerRatingCount: 0,
  sellerRatingAverage: 0,
};

const buyerStatus: TransactionStatus = {
  productId: 'product-1',
  isSellerOwner: false,
  sellerMarkedSold: false,
  sellerMarkedSoldAt: null,
  buyerConfirmed: false,
  buyerConfirmedAt: null,
  buyerIdForSellerReview: null,
  canMarkSold: false,
  canMarkReceived: true,
  canBuyerReviewSeller: false,
  canBuyerReviewProduct: false,
  canSellerReviewBuyer: false,
  message: 'Waiting for seller to mark this product as sold before reviews are enabled.',
};

const renderActions = (
  status: TransactionStatus | null,
  user: CurrentUser | null = { id: 'buyer-user', sellers: [] },
) =>
  render(
    <TransactionActions
      product={product}
      user={user}
      status={status}
      onRefresh={jest.fn(async () => undefined)}
      onNotify={jest.fn()}
    />,
  );

describe('TransactionActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows visitor guidance without action buttons', () => {
    renderActions(null, null);

    expect(screen.getByText('Sign in to confirm product handoff or leave transaction reviews.')).toBeTruthy();
    expect(screen.queryByText('I Got This Product')).toBeNull();
    expect(screen.queryByText('Mark as Sold')).toBeNull();
  });

  it('shows buyer received action and disabled review messaging', () => {
    renderActions(buyerStatus);

    expect(screen.getByText('I Got This Product')).toBeTruthy();
    expect(screen.queryByText('Mark as Sold')).toBeNull();
    expect(screen.getByText('Reviews are disabled until you are eligible for this transaction.')).toBeTruthy();
  });

  it('submits buyer received acknowledgement', async () => {
    jest.mocked(api.markProductReceived).mockResolvedValue({});
    const onRefresh = jest.fn(async () => undefined);
    const onNotify = jest.fn();

    render(
      <TransactionActions
        product={product}
        user={{ id: 'buyer-user', sellers: [] }}
        status={buyerStatus}
        onRefresh={onRefresh}
        onNotify={onNotify}
      />,
    );

    fireEvent.press(screen.getByText('I Got This Product'));

    await waitFor(() => {
      expect(api.markProductReceived).toHaveBeenCalledWith('product-1');
      expect(onNotify).toHaveBeenCalledWith('success', 'Product receipt confirmed.');
    });
  });

  it('enables buyer review when eligible', async () => {
    jest.mocked(api.postSellerReview).mockResolvedValue({});

    renderActions({
      ...buyerStatus,
      sellerMarkedSold: true,
      canBuyerReviewSeller: true,
      canBuyerReviewProduct: true,
      message:
        'The seller marked this product as sold. If you bought this item, please confirm and leave a review.',
    });

    fireEvent.press(screen.getByText('Review seller'));

    await waitFor(() => {
      expect(api.postSellerReview).toHaveBeenCalledWith(
        'seller-1',
        'product-1',
        5,
        'Great purchase with local pickup.',
      );
    });
  });

  it('shows seller sold action and disabled buyer review message', () => {
    renderActions(
      {
        ...buyerStatus,
        isSellerOwner: true,
        canMarkSold: true,
        canMarkReceived: false,
        message:
          'Waiting for buyer to confirm they received this product before buyer review is enabled.',
      },
      { id: 'seller-user', sellers: [{ id: 'seller-1' }] },
    );

    expect(screen.getByText('Mark as Sold')).toBeTruthy();
    expect(screen.queryByText('I Got This Product')).toBeNull();
    expect(
      screen.getByText('Buyer review is disabled until the buyer confirms they received this product.'),
    ).toBeTruthy();
  });

  it('reports duplicate acknowledgement API errors', async () => {
    jest.mocked(api.markProductReceived).mockRejectedValue(new Error('Product receipt already confirmed'));
    const onNotify = jest.fn();

    render(
      <TransactionActions
        product={product}
        user={{ id: 'buyer-user', sellers: [] }}
        status={buyerStatus}
        onRefresh={jest.fn(async () => undefined)}
        onNotify={onNotify}
      />,
    );

    fireEvent.press(screen.getByText('I Got This Product'));

    await waitFor(() => {
      expect(onNotify).toHaveBeenCalledWith('error', 'Product receipt already confirmed');
    });
  });
});
