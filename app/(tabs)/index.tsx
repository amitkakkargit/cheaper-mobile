import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';

import { getAllProducts, searchProducts } from '@/lib/api';
import type { ProductWithSeller } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function HomeScreen() {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Search for nearby products or enter a city.');
  const [loading, setLoading] = useState(true);

  const loadProducts = async (searchQuery = '', searchLocation = '') => {
    setLoading(true);
    try {
      const result = searchQuery || searchLocation
        ? await searchProducts(searchQuery, searchLocation)
        : await getAllProducts();
      setProducts(result);
      setStatus(result.length ? `Showing ${result.length} deals.` : 'No matching products found.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const detectLocation = async () => {
    try {
      setStatus('Detecting current location...');
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== 'granted') {
        setStatus('Location permission denied. Enter a city manually.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Low });
      const places = await Location.reverseGeocodeAsync(position.coords);
      const place = places[0];

      if (!place) {
        setStatus('Unable to find a city for your location.');
        return;
      }

      const detectedLocation = [place.city || place.region, place.region, place.country]
        .filter(Boolean)
        .join(', ');

      setLocation(detectedLocation);
      setStatus(`Detected location: ${detectedLocation}`);
      loadProducts(query, detectedLocation);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to detect location');
    }
  };

  const handleSearch = () => {
    loadProducts(query, location);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Cheaper</Text>
        <Text style={styles.subtitle}>Nearby deals and local pickup products.</Text>
      </View>
      <View style={styles.searchCard}>
        <Text style={styles.label}>Search</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by title or category"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Text style={styles.label}>Location</Text>
        <View style={styles.locationRow}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            placeholder="Enter city or state"
            placeholderTextColor="#94a3b8"
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity style={styles.locationButton} onPress={detectLocation}>
            <Text style={styles.locationButtonText}>Detect</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSearch}>
            <Text style={styles.primaryButtonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setQuery('');
              setLocation('');
              loadProducts();
            }}
          >
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.status}>{status}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1d4ed8" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  header: {
    marginBottom: 12,
  },
  brand: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#475569',
    fontSize: 14,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    color: '#0f172a',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    borderRadius: 14,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  status: {
    color: '#334155',
    marginBottom: 12,
  },
  loader: {
    marginTop: 32,
  },
  list: {
    paddingBottom: 24,
  },
});
