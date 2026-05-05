import { StyleSheet, Text, View } from "react-native";

export type NotificationState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

interface FormNotificationProps {
  notification: NotificationState;
}

export default function FormNotification({
  notification,
}: FormNotificationProps) {
  if (!notification) {
    return null;
  }

  return (
    <View style={[styles.container, styles[notification.type]]}>
      <Text style={styles.message}>{notification.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 10,
    padding: 12,
  },
  success: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
    borderWidth: 1,
  },
  error: {
    backgroundColor: "#fee2e2",
    borderColor: "#b91c1c",
    borderWidth: 1,
  },
  info: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0284c7",
    borderWidth: 1,
  },
  message: {
    color: "#0f172a",
    fontSize: 14,
  },
});
