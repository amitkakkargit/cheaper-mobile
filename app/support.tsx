import Constants from "expo-constants";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import FormNotification, {
  type NotificationState,
} from "@/components/FormNotification";
import { createSupportTicket } from "@/lib/api";
import type { SupportTicketCategory } from "@/lib/types";

const categories: SupportTicketCategory[] = [
  "Login issue",
  "Payment issue",
  "Product issue",
  "Seller issue",
  "App bug",
  "Account issue",
  "Delivery issue",
  "Other",
];

const getDeviceInfo = () =>
  `${Platform.OS} ${Platform.Version ?? ""} | ${Constants.deviceName ?? "Unknown device"}`;

export default function SupportScreen() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("App bug");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [notification, setNotification] = useState<NotificationState>(null);

  const submit = async () => {
    if (subject.trim().length < 3 || description.trim().length < 10) {
      setNotification({
        type: "error",
        message: "Please add a title and at least 10 characters of detail.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    try {
      const ticket = await createSupportTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        email: email.trim() || undefined,
        productId: productId.trim() || undefined,
        screenshotUrl: screenshotUrl.trim() || undefined,
        source: "mobile",
        deviceInfo: getDeviceInfo(),
        appVersion: Constants.expoConfig?.version ?? "mobile-local",
      });
      setTicketId(ticket.id);
      setNotification({
        type: "success",
        message: `${ticket.message} Ticket reference: ${ticket.id}`,
      });
      setSubject("");
      setDescription("");
      setProductId("");
      setScreenshotUrl("");
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create support ticket",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Help & Support</Text>
        <Text style={styles.subtitle}>
          Submit a support ticket when login, listings, handoff confirmation,
          reviews, or account features are not working.
        </Text>

        {ticketId ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Latest ticket</Text>
            <Text style={styles.summaryText}>{ticketId}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Issue title</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Unable to confirm product handoff"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                accessibilityRole="button"
                style={[
                  styles.categoryChip,
                  category === item && styles.activeCategoryChip,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.activeCategoryText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what happened and what you expected."
            placeholderTextColor="#94a3b8"
            multiline
          />

          <Text style={styles.label}>Email address (optional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Related product ID (optional)</Text>
          <TextInput
            style={styles.input}
            value={productId}
            onChangeText={setProductId}
            placeholder="Product reference"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Screenshot URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={screenshotUrl}
            onChangeText={setScreenshotUrl}
            placeholder="Image URL or upload placeholder"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={submit}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Creating ticket..." : "Submit support ticket"}
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 32,
  },
  header: {
    color: "#0f172a",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#475569",
    lineHeight: 22,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    color: "#1e3a8a",
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryText: {
    color: "#475569",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: "#64748b",
    fontWeight: "700",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 12,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeCategoryChip: {
    backgroundColor: "#1d4ed8",
  },
  categoryText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  activeCategoryText: {
    color: "#ffffff",
  },
  primaryButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
