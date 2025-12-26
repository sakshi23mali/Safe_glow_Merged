import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi } from "../../shared/api/authApi";
import { loginUser } from "../../shared/auth/authService";

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefill = route?.params?.prefillEmail;
    if (typeof prefill === "string" && prefill.trim()) {
      setEmail(prefill.trim());
    }
  }, [route?.params?.prefillEmail]);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill all fields");
    }

    setLoading(true);
    try {
      const existsRes = await authApi.exists({ email });
      if (!existsRes?.exists) {
        Alert.alert("Account not found. Please register first.");
        navigation.navigate("Register", { prefillEmail: email });
        return;
      }

      await loginUser({ email, password });
      navigation.replace("Home");
    } catch (error) {
      const msg = String(error?.message || "Login failed");
      if (error?.status === 404) {
        Alert.alert("Account not found. Please register first.");
        navigation.navigate("Register", { prefillEmail: email });
        return;
      }
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0a84ff"
            style={{ marginTop: 20 }}
          />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}

        <View style={styles.row}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    color: "#222",
  },
  button: {
    backgroundColor: "#0a84ff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  link: {
    color: "#0a84ff",
    fontWeight: "600",
  },
});
