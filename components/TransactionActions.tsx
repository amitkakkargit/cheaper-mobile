import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  markProductReceived,
  markProductSold,
  postBuyerReview,
  postProductReview,
  postSellerReview,
} from '@/lib/api';
import type { CurrentUser, ProductWithSeller, TransactionStatus } from '@/lib/types';
import {
  canBuyerMarkReceived,
  canBuyerReviewSeller,
  canSellerMarkSold,
  canSellerReviewBuyer,
  getTransactionStatusMessage,
} from '@/lib/transactionRules';
import RatingStars from '@/components/RatingStars';

interface TransactionActionsProps {
  product: ProductWithSeller;
  user: CurrentUser | null;
  status: TransactionStatus | null;
  loading?: boolean;
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export default function TransactionActions({
  product,
  user,
  status,
  loading = false,
  onRefresh,
  onNotify,
}: TransactionActionsProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Great purchase with local pickup.');
  const [buyerReviewComment, setBuyerReviewComment] = useState(
    'Smooth local handoff and confirmed receipt.',
  );
  const [submitting, setSubmitting] = useState(false);

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setSubmitting(true);
    try {
      await action();
      onNotify('success', success);
      await onRefresh();
    } catch (error) {
      onNotify(
        'error',
        error instanceof Error ? error.message : 'Action failed',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buyerReviewEnabled = status ? canBuyerReviewSeller(status) : false;
  const sellerReviewEnabled = status ? canSellerReviewBuyer(status) : false;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Handoff confirmation</Text>
      <Text style={styles.detailText}>
        Reviews unlock only after the transaction is acknowledged by the seller
        or buyer according to the marketplace rules.
      </Text>

      {!user ? (
        <Text style={styles.statusText}>
          Sign in to confirm product handoff or leave transaction reviews.
        </Text>
      ) : null}

      {loading && user ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#1d4ed8" />
          <Text style={styles.statusText}>Checking transaction status...</Text>
        </View>
      ) : null}

      {user && status ? (
        <Text accessibilityRole="text" style={styles.statusText}>
          {getTransactionStatusMessage(status)}
        </Text>
      ) : null}

      {status?.isSellerOwner ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Mark product as sold"
          style={[
            styles.secondaryButton,
            (!canSellerMarkSold(status) || submitting) && styles.disabledButton,
          ]}
          onPress={() =>
            runAction(
              () => markProductSold(product.id),
              'Product marked as sold.',
            )
          }
          disabled={!canSellerMarkSold(status) || submitting}
        >
          <Text style={styles.secondaryButtonText}>Mark as Sold</Text>
        </TouchableOpacity>
      ) : null}

      {user && status && !status.isSellerOwner ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Confirm that you got this product"
          style={[
            styles.secondaryButton,
            (!canBuyerMarkReceived(status) || submitting) &&
              styles.disabledButton,
          ]}
          onPress={() =>
            runAction(
              () => markProductReceived(product.id),
              'Product receipt confirmed.',
            )
          }
          disabled={!canBuyerMarkReceived(status) || submitting}
        >
          <Text style={styles.secondaryButtonText}>I Got This Product</Text>
        </TouchableOpacity>
      ) : null}

      {user && status && !status.isSellerOwner ? (
        <View
          accessibilityState={{ disabled: !buyerReviewEnabled }}
          style={[
            styles.reviewPanel,
            !buyerReviewEnabled && styles.disabledPanel,
          ]}
        >
          <Text style={styles.sectionHeading}>Review this transaction</Text>
          {!buyerReviewEnabled ? (
            <Text style={styles.statusText}>
              Reviews are disabled until you are eligible for this transaction.
            </Text>
          ) : null}
          <Text style={styles.label}>Rating</Text>
          <RatingStars
            rating={rating}
            label={`Rate this transaction ${rating} out of 5`}
            interactive={buyerReviewEnabled}
            onRatingChange={setRating}
          />
          <Text style={styles.label}>Comment</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            editable={buyerReviewEnabled}
            placeholder="Write what you liked about the product or seller."
            placeholderTextColor="#94a3b8"
            multiline
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[
                styles.primaryButton,
                (!buyerReviewEnabled || submitting) && styles.disabledButton,
              ]}
              onPress={() =>
                runAction(
                  () =>
                    postProductReview(
                      product.id,
                      product.sellerId,
                      rating,
                      comment,
                    ),
                  'Product review submitted.',
                )
              }
              disabled={!buyerReviewEnabled || submitting}
            >
              <Text style={styles.primaryButtonText}>Review product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={[
                styles.primaryButton,
                (!buyerReviewEnabled || submitting) && styles.disabledButton,
              ]}
              onPress={() =>
                runAction(
                  () =>
                    postSellerReview(
                      product.sellerId,
                      product.id,
                      rating,
                      comment,
                    ),
                  'Seller review submitted.',
                )
              }
              disabled={!buyerReviewEnabled || submitting}
            >
              <Text style={styles.primaryButtonText}>Review seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {user && status?.isSellerOwner ? (
        <View
          accessibilityState={{ disabled: !sellerReviewEnabled }}
          style={[
            styles.reviewPanel,
            !sellerReviewEnabled && styles.disabledPanel,
          ]}
        >
          <Text style={styles.sectionHeading}>Review the buyer</Text>
          {!sellerReviewEnabled ? (
            <Text style={styles.statusText}>
              Buyer review is disabled until the buyer confirms they received
              this product.
            </Text>
          ) : null}
          <Text style={styles.label}>Rating</Text>
          <RatingStars
            rating={rating}
            label={`Rate this buyer ${rating} out of 5`}
            interactive={sellerReviewEnabled}
            onRatingChange={setRating}
          />
          <Text style={styles.label}>Comment</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={buyerReviewComment}
            onChangeText={setBuyerReviewComment}
            editable={sellerReviewEnabled}
            placeholder="Share how the buyer handled the local pickup."
            placeholderTextColor="#94a3b8"
            multiline
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={[
              styles.primaryButton,
              (!sellerReviewEnabled ||
                !status.buyerIdForSellerReview ||
                submitting) &&
                styles.disabledButton,
            ]}
            onPress={() =>
              runAction(
                () =>
                  postBuyerReview(
                    product.id,
                    status.buyerIdForSellerReview ?? '',
                    rating,
                    buyerReviewComment,
                  ),
                'Buyer review submitted.',
              )
            }
            disabled={
              !sellerReviewEnabled ||
              !status.buyerIdForSellerReview ||
              submitting
            }
          >
            <Text style={styles.primaryButtonText}>Review buyer</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  statusText: {
    color: '#475569',
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledPanel: {
    opacity: 0.82,
  },
  reviewPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    color: '#334155',
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    color: '#0f172a',
    minHeight: 88,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
