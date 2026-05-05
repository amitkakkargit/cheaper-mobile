import { Link } from "expo-router";
import { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import FormNotification, {
  type NotificationState,
} from "@/components/FormNotification";
import {
  clearUserSession,
  getCachedCurrentUser,
  getCurrentUser,
  requestEmailOtp,
  requestPhoneOtp,
  updateProfile,
  verifyEmailOtp,
  verifyPhoneOtp,
} from "@/lib/api";
import { CurrentUser } from "@/lib/types";

type LoginMode = "phone" | "email";

function initialsFor(user: CurrentUser | null) {
  const value = user?.name || user?.email || user?.phone || "?";
  return value.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const cachedUser = getCachedCurrentUser();
  const [mode, setMode] = useState<LoginMode>("phone");
  const [target, setTarget] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<CurrentUser | null>(cachedUser);
  const [isAuthReady, setIsAuthReady] = useState(Boolean(cachedUser));
  const [name, setName] = useState(cachedUser?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(cachedUser?.avatarUrl ?? "");
  const [notification, setNotification] = useState<NotificationState>(null);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser().then((current) => {
      if (!isMounted) return;
      setUser(current);
      setName(current?.name ?? "");
      setAvatarUrl(current?.avatarUrl ?? "");
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const requestOtp = async () => {
    try {
      const response =
        mode === "phone"
          ? await requestPhoneOtp(target)
          : await requestEmailOtp(target);
      setNotification({
        type: "success",
        message: `OTP sent. Dev OTP: ${response.otp}`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to request OTP",
      });
    }
  };

  const verifyOtp = async () => {
    try {
      if (mode === "phone") {
        await verifyPhoneOtp(target, otp);
      } else {
        await verifyEmailOtp(target, otp);
      }
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setName(currentUser?.name ?? "");
      setAvatarUrl(currentUser?.avatarUrl ?? "");
      setNotification({ type: "success", message: "Logged in successfully." });
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to verify OTP",
      });
    }
  };

  const saveProfile = async () => {
    try {
      const updatedUser = await updateProfile({
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      setUser(updatedUser);
      setNotification({ type: "success", message: "Profile saved." });
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to save profile",
      });
    }
  };

  const logout = async () => {
    await clearUserSession();
    setUser(null);
    setTarget("");
    setOtp("");
    setName("");
    setAvatarUrl("");
    setNotification({ type: "info", message: "Logged out." });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.pageHeader}>
            <Text style={styles.header}>Account</Text>
            <Text style={styles.subtitle}>
              Manage your profile, privacy, support, and sign-in options.
            </Text>
          </View>

          {user ? (
            <>
              <View style={styles.profileHeaderCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initialsFor(user)}</Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>
                    {user.name ?? user.email ?? user.phone ?? "Marketplace member"}
                  </Text>
                  <Text style={styles.profileMeta}>
                    {user.email ?? user.phone ?? "Signed in"}
                  </Text>
                </View>
              </View>

              <View style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>Public profile</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={saveProfile}
                    style={styles.compactPrimaryButton}
                  >
                    <Text style={styles.compactPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>Display name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor="#94a3b8"
                />
                <Text style={styles.label}>Avatar URL</Text>
                <TextInput
                  style={styles.input}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="Avatar image URL"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.settingsGroup}>
                <Link href="/privacy-settings" asChild>
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.settingsRow}
                  >
                    <View>
                      <Text style={styles.settingsTitle}>Privacy Settings</Text>
                      <Text style={styles.settingsMeta}>
                        Visibility, location, and recommendations
                      </Text>
                    </View>
                    <Text style={styles.chevron}>{">"}</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/support" asChild>
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.settingsRow}
                  >
                    <View>
                      <Text style={styles.settingsTitle}>Help & Support</Text>
                      <Text style={styles.settingsMeta}>
                        Report bugs or contact support
                      </Text>
                    </View>
                    <Text style={styles.chevron}>{">"}</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.logoutButton}
                onPress={logout}
              >
                <Text style={styles.logoutText}>Sign out</Text>
              </TouchableOpacity>
            </>
          ) : !isAuthReady ? (
            <View style={styles.groupCard} accessibilityLabel="Checking account">
              <Text style={styles.groupTitle}>Checking account</Text>
              <Text style={styles.helperText}>
                Keeping your profile ready while we confirm your session.
              </Text>
              <View style={styles.checkingRow}>
                <View style={styles.checkingAvatar} />
                <View style={styles.checkingTextBlock}>
                  <View style={styles.checkingLineWide} />
                  <View style={styles.checkingLineShort} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.groupCard}>
              <Text style={styles.groupTitle}>Sign in</Text>
              <Text style={styles.helperText}>
                Use email or phone OTP to access seller tools, reviews, and
                handoff confirmations.
              </Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[
                    styles.segmentButton,
                    mode === "phone" && styles.activeSegment,
                  ]}
                  onPress={() => setMode("phone")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === "phone" && styles.activeSegmentText,
                    ]}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[
                    styles.segmentButton,
                    mode === "email" && styles.activeSegment,
                  ]}
                  onPress={() => setMode("email")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === "email" && styles.activeSegmentText,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>
                {mode === "phone" ? "Phone number" : "Email address"}
              </Text>
              <TextInput
                style={styles.input}
                value={target}
                onChangeText={setTarget}
                placeholder={
                  mode === "phone" ? "+919876543210" : "you@example.com"
                }
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType={mode === "phone" ? "phone-pad" : "email-address"}
              />
              <TouchableOpacity style={styles.secondaryButton} onPress={requestOtp}>
                <Text style={styles.secondaryButtonText}>Request OTP</Text>
              </TouchableOpacity>
              <Text style={styles.label}>OTP code</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={verifyOtp}>
                <Text style={styles.primaryButtonText}>Verify OTP</Text>
              </TouchableOpacity>
            </View>
          )}

          <FormNotification notification={notification} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  pageHeader: {
    gap: 4,
    marginBottom: 2,
  },
  header: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748b",
    lineHeight: 21,
  },
  profileHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "800",
  },
  profileMeta: {
    color: "#64748b",
    marginTop: 2,
  },
  groupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  groupTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  helperText: {
    color: "#64748b",
    lineHeight: 20,
  },
  checkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
  },
  checkingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
  },
  checkingTextBlock: {
    flex: 1,
    gap: 8,
  },
  checkingLineWide: {
    width: "58%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  checkingLineShort: {
    width: "38%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#eef2f7",
  },
  label: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0f172a",
    minHeight: 44,
  },
  compactPrimaryButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  compactPrimaryText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  settingsGroup: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  settingsRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  settingsTitle: {
    color: "#0f172a",
    fontWeight: "800",
  },
  settingsMeta: {
    color: "#64748b",
    marginTop: 2,
    lineHeight: 19,
  },
  chevron: {
    color: "#94a3b8",
    fontSize: 24,
    fontWeight: "700",
  },
  logoutButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  logoutText: {
    color: "#b91c1c",
    fontWeight: "800",
  },
  segmentedControl: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
  },
  segmentButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  activeSegment: {
    backgroundColor: "#ffffff",
  },
  segmentText: {
    color: "#64748b",
    fontWeight: "800",
  },
  activeSegmentText: {
    color: "#0f172a",
  },
  primaryButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    minHeight: 44,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    minHeight: 44,
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "800",
  },
});
