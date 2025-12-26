import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ProductLoadingScreen({ route, navigation }) {
  const skinType = route?.params?.skinType ?? "normal";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Products", { skinType });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, skinType]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.subtitle}>
        Preparing product suggestions based on your skin type...
      </Text>
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
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});

