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
import { logout, registerUser } from "../../shared/auth/authService";

function passwordStrengthError(password) {
  if (password.length < 1) return "Password is required";
  return null;
}

export default function RegisterScreen({ navigation, route }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefill = route?.params?.prefillEmail;
    if (typeof prefill === "string" && prefill.trim()) {
      setEmail(prefill.trim());
    }
  }, [route?.params?.prefillEmail]);

  const validate = () => {
    if (!username || !email || !password || !confirm)
      return "Please fill all required fields";
    if (username.trim().length < 3)
      return "Username must be at least 3 characters";
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) return "Invalid email address";
    const strength = passwordStrengthError(password);
    if (strength) return strength;
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  const handleRegister = async () => {
    console.log("Register button clicked");
    const error = validate();
    if (error) {
      console.log("Validation error:", error);
      return Alert.alert("Error", error);
    }

    setLoading(true);
    console.log("Starting registration for:", { username, email });
    try {
      const res = await registerUser({ username, name, email, password });
      console.log("Registration response:", res);
      await logout();
      if (res?.message === "Verification email sent") {
        Alert.alert(
          "Verification required",
          "A verification email has been sent. Please verify your email, then login."
        );
        navigation.replace("Login", { prefillEmail: email });
        return;
      }

      Alert.alert(
        "Success",
        "Registration successful! You can now login with your credentials.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Login", { prefillEmail: email }),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", err?.message || "Registration failed");
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
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Full Name (optional)"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0a84ff"
            style={{ marginTop: 20 }}
          />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        )}

        <View style={styles.row}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Login</Text>
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
