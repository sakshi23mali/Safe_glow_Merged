import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logout } from "../../shared/auth/authService";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.logoImage}
        />
      </View>

      <Text style={styles.title}>Welcome to SafeGlow</Text>
      <Text style={styles.subtitle}>
        Personalized skincare recommendations
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Quiz")}
      >
        <Text style={styles.primaryButtonText}>Start Skin Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Camera")}
      >
        <Text style={styles.secondaryButtonText}>Open Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Products")}
      >
        <Text style={styles.secondaryButtonText}>
          View Product Suggestions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          navigation.replace("Login");
        }}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#0a84ff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

