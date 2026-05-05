import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { createSeller, getCurrentUser } from '@/lib/api';
import { CurrentUser } from '@/lib/types';
import FormNotification, { type NotificationState } from '@/components/FormNotification';

export default function CreateSellerScreen() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
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

      const seller = await createSeller({
        name,
        location,
        bio,
        avatarUrl,
        latitude: 12.9716,
        longitude: 77.5946,
      });

      setNotification({
        type: 'success',
        message: `Seller profile created. ID: ${seller.id}`,
      });
      setName('');
      setLocation('');
      setBio('');
      setAvatarUrl('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to create seller profile',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Seller onboarding</Text>
        <Text style={styles.subtitle}>Create your public seller profile for local buyers.</Text>
        {user ? null : (
          <Text style={styles.infoText}>Sign in through the Account tab before creating a seller profile.</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Seller name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Sunil's Store"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Hyderabad, Gachibowli"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Seller bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Trusted local seller with fast replies."
            placeholderTextColor="#94a3b8"
            multiline
          />
          <Text style={styles.label}>Profile image URL</Text>
          <TextInput
            style={styles.input}
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://example.com/avatar.jpg"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>Create profile</Text>
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