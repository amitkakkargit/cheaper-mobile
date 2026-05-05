import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { createProduct, getCurrentUser } from '@/lib/api';
import { CurrentUser } from '@/lib/types';
import FormNotification, { type NotificationState } from '@/components/FormNotification';

const categories = [
  'Electronics',
  'Home',
  'Fashion',
  'Vehicles',
  'Food',
  'Miscellaneous',
];
const conditions = ['New', 'Second-hand', 'Used', 'Refurbished'];

export default function PostProductScreen() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [sellerId, setSellerId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [currentPrice, setCurrentPrice] = useState('1');
  const [previousPrice, setPreviousPrice] = useState('1');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notification, setNotification] = useState<NotificationState>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleSubmit = async () => {
    try {
      if (!user) {
        setNotification({ type: 'error', message: 'Please sign in first.' });
        return;
      }

      await createProduct({
        sellerId,
        title,
        description,
        imageUrl,
        currentPrice: Number(currentPrice),
        previousPrice: Number(previousPrice),
        discountPercentage: previousPrice ? Math.max(0, Math.round(((Number(previousPrice) - Number(currentPrice)) / Number(previousPrice)) * 100)) : 0,
        condition: condition as any,
        location,
        category,
        latitude: 12.9716,
        longitude: 77.5946,
      });

      setNotification({ type: 'success', message: 'Product posted successfully.' });
      setTitle('');
      setCategory('');
      setCondition('');
      setSellerId('');
      setCurrentPrice('1');
      setPreviousPrice('1');
      setLocation('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to post product',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Post a product</Text>
        <Text style={styles.subtitle}>Share product details for local buyers in your city.</Text>
        {user ? null : (
          <Text style={styles.infoText}>Sign in first from the Account tab to post products.</Text>
        )}
        <View style={styles.card}>
          <Text style={styles.label}>Seller ID</Text>
          <TextInput
            style={styles.input}
            value={sellerId}
            onChangeText={setSellerId}
            placeholder="Your seller ID"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Product title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Used gaming laptop"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.gridRow}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionButton, category === item && styles.optionButtonActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.optionText, category === item && styles.optionTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.gridRow}>
            {conditions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionButton, condition === item && styles.optionButtonActive]}
                onPress={() => setCondition(item)}
              >
                <Text style={[styles.optionText, condition === item && styles.optionTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.label}>Current price</Text>
              <TextInput
                style={styles.input}
                value={currentPrice}
                keyboardType="numeric"
                onChangeText={setCurrentPrice}
              />
            </View>
            <View style={styles.priceGroup}>
              <Text style={styles.label}>Previous price</Text>
              <TextInput
                style={styles.input}
                value={previousPrice}
                keyboardType="numeric"
                onChangeText={setPreviousPrice}
              />
            </View>
          </View>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Bangalore, Koramangala"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the product condition and pickup details."
            placeholderTextColor="#94a3b8"
            multiline
          />
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/product.jpg"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>Post product</Text>
          </TouchableOpacity>
          <FormNotification notification={notification} />
        </View>
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
    paddingBottom: 32,
  },
  header: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#475569',
    marginBottom: 12,
  },
  infoText: {
    color: '#64748b',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    color: '#0f172a',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  optionButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  optionText: {
    color: '#0f172a',
  },
  optionTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceGroup: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});