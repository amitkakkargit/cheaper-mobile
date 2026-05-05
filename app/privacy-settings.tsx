import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FormNotification, {
  type NotificationState,
} from "@/components/FormNotification";

interface PrivacySettingsState {
  profileVisible: boolean;
  showSellerRatings: boolean;
  showSoldProducts: boolean;
  preciseLocation: boolean;
  allowDirectMessages: boolean;
  personalizedRecommendations: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const settings: {
  id: keyof PrivacySettingsState;
  title: string;
  description: string;
}[] = [
  {
    id: "profileVisible",
    title: "Public profile",
    description: "Allow marketplace users to view your buyer or seller profile.",
  },
  {
    id: "showSellerRatings",
    title: "Show seller ratings publicly",
    description: "Display seller rating summaries on your public profile.",
  },
  {
    id: "showSoldProducts",
    title: "Show sold products",
    description: "Let visitors see products you have already marked as sold.",
  },
  {
    id: "preciseLocation",
    title: "Precise location visibility",
    description: "Use neighbourhood-level location instead of city-only location.",
  },
  {
    id: "allowDirectMessages",
    title: "Allow direct messages",
    description: "Let logged-in users contact you about local listings.",
  },
  {
    id: "personalizedRecommendations",
    title: "Personalized recommendations",
    description: "Use marketplace activity to improve product suggestions.",
  },
  {
    id: "emailNotifications",
    title: "Email notifications",
    description: "Receive account, review, and handoff updates by email.",
  },
  {
    id: "pushNotifications",
    title: "Push notifications",
    description: "Placeholder for future mobile push preferences.",
  },
];

const defaultSettings: PrivacySettingsState = {
  profileVisible: true,
  showSellerRatings: true,
  showSoldProducts: false,
  preciseLocation: false,
  allowDirectMessages: true,
  personalizedRecommendations: true,
  emailNotifications: true,
  pushNotifications: false,
};

export default function PrivacySettingsScreen() {
  const [values, setValues] = useState(defaultSettings);
  const [notification, setNotification] = useState<NotificationState>(null);
  const enabledCount = useMemo(
    () => Object.values(values).filter(Boolean).length,
    [values],
  );

  const toggle = (id: keyof PrivacySettingsState) => {
    setValues((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.header}>Privacy Settings</Text>
      <Text style={styles.subtitle}>
        Control profile visibility, location sharing, recommendations, and
        notification preferences.
      </Text>

      <View style={styles.summaryCard} accessibilityLiveRegion="polite">
        <Text style={styles.summaryTitle}>{enabledCount} settings enabled</Text>
        <Text style={styles.summaryText}>
          Preferences are saved locally for now and ready for future API
          persistence.
        </Text>
      </View>

      <View style={styles.card}>
        {settings.map((setting) => (
          <View key={setting.id} style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>
                {setting.description}
              </Text>
            </View>
            <Switch
              value={values[setting.id]}
              onValueChange={() => toggle(setting.id)}
              accessibilityLabel={setting.title}
            />
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.settingTitle}>Data and account controls</Text>
        <Text style={styles.settingDescription}>
          Data download, account export, and account deletion are planned
          controls. This screen keeps the privacy workflow visible while
          backend persistence is added.
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={() =>
          setNotification({
            type: "success",
            message: "Privacy preferences saved locally.",
          })
        }
      >
        <Text style={styles.primaryButtonText}>Save privacy settings</Text>
      </TouchableOpacity>

      <FormNotification notification={notification} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#f8fafc",
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
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    gap: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  settingDescription: {
    color: "#475569",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
