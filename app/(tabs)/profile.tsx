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

import {
  clearUserSession,
  getCurrentUser,
  requestEmailOtp,
  requestPhoneOtp,
  updateProfile,
  verifyEmailOtp,
  verifyPhoneOtp,
} from "@/lib/api";
import { CurrentUser } from "@/lib/types";
import FormNotification, {
  type NotificationState,
} from "@/components/FormNotification";

type LoginMode = "phone" | "email";

export default function ProfileScreen() {
  const [mode, setMode] = useState<LoginMode>("phone");
  const [target, setTarget] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notification, setNotification] = useState<NotificationState>(null);

  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current);
      setName(current?.name ?? "");
      setAvatarUrl(current?.avatarUrl ?? "");
    });
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Account</Text>
        <Text style={styles.subtitle}>
          Sign in and manage your buyer or seller profile.
        </Text>

        {user ? (
          <View style={styles.card}>
            <Text style={styles.label}>Signed in as</Text>
            <Text style={styles.value}>
              {user.name ?? user.email ?? user.phone ?? "Anonymous"}
            </Text>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{user.id}</Text>
            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="Avatar image URL"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveProfile}
            >
              <Text style={styles.primaryButtonText}>Save profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  mode === "phone" && styles.activeToggle,
                ]}
                onPress={() => setMode("phone")}
              >
                <Text style={styles.toggleText}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  mode === "email" && styles.activeToggle,
                ]}
                onPress={() => setMode("email")}
              >
                <Text style={styles.toggleText}>Email</Text>
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
            <TouchableOpacity style={styles.primaryButton} onPress={requestOtp}>
              <Text style={styles.primaryButtonText}>Request OTP</Text>
            </TouchableOpacity>
            <Text style={[styles.label, styles.marginTop]}>OTP code</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    color: "#475569",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 6,
  },
  value: {
    color: "#0f172a",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 12,
    color: "#0f172a",
    marginBottom: 12,
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
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  activeToggle: {
    backgroundColor: "#1d4ed8",
  },
  toggleText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  marginTop: {
    marginTop: 12,
  },
});
