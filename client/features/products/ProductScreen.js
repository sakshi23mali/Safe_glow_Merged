import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { productApi } from "../../shared/api/productApi";

const FALLBACK_IMAGE_URI =
  "https://placehold.co/300x200/FFE4E1/555/png?text=No+Image";

function ProductImage({ uri }) {
  const [failed, setFailed] = useState(false);
  const finalUri = !failed && uri ? uri : FALLBACK_IMAGE_URI;

  return (
    <Image
      source={{ uri: finalUri }}
      style={styles.productImage}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductScreen({ route }) {
  const skinType = route?.params?.skinType ?? "normal";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await productApi.recommend(skinType);
      setProducts(data?.products || []);
    } catch (err) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [skinType]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const renderVerdict = (verdict) => {
    if (verdict === "safe") {
      return <Text style={[styles.badge, styles.safe]}>Safe</Text>;
    }

    if (verdict === "caution") {
      return <Text style={[styles.badge, styles.avoid]}>Use with caution</Text>;
    }

    return <Text style={[styles.badge, styles.unknown]}>Review ingredients</Text>;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Fetching suggestions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
        <TouchableOpacity onPress={loadProducts} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={styles.center}>
        <Text>No suggestions available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended products for {skinType} skin</Text>

      <FlatList
        data={products}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ProductImage uri={item.image} />

            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.snippet}>{item.snippet}</Text>

            <View style={styles.row}>
              {renderVerdict(item.verdict)}

              {item.link ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(item.link)}
                  style={styles.button}
                >
                  <Text style={styles.linkText}>View product</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    padding: 12,
    backgroundColor: "#f8f8ff",
    marginBottom: 12,
    borderRadius: 10,
    borderColor: "#e5e5f0",
    borderWidth: 1,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  source: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  snippet: {
    fontSize: 13,
    color: "#333",
    marginTop: 8,
  },
  row: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    overflow: "hidden",
  },
  safe: { backgroundColor: "#d1fae5", color: "#065f46" },
  avoid: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  unknown: { backgroundColor: "#fef3c7", color: "#92400e" },
  linkText: {
    color: "#fff",
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
