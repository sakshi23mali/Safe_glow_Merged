import { useIsFocused } from "@react-navigation/native";
import * as ExpoCamera from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CameraScreen({ navigation, route }) {
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  const HasCameraView = typeof ExpoCamera.CameraView !== "undefined";
  const HasCamera = typeof ExpoCamera.Camera !== "undefined";

  const [permission, requestPermission] = ExpoCamera.useCameraPermissions();

  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    if (!HasCameraView && !HasCamera) {
      setHasPermission(false);
      return;
    }

    if (permission) {
      setHasPermission(permission.granted === true);
    }
  }, [HasCamera, HasCameraView, permission]);

  const [facing, setFacing] = useState("back");
  const [type, setType] = useState(
    ExpoCamera.Camera?.Constants?.Type?.back ?? "back"
  );
  const [loading, setLoading] = useState(false);

  const skinType = route?.params?.skinType ?? "normal";

  const cameraKey = `camera-${facing}-${type}`;

  function toggleFacing() {
    setFacing((p) => (p === "back" ? "front" : "back"));
    setType((prev) =>
      prev === ExpoCamera.Camera?.Constants?.Type?.back
        ? ExpoCamera.Camera?.Constants?.Type?.front
        : ExpoCamera.Camera?.Constants?.Type?.back
    );
  }

  async function ensureCameraPermission() {
    if (permission?.granted) return true;
    const res = await requestPermission();
    return res?.granted === true;
  }

  async function takePhoto() {
    try {
      const ok = await ensureCameraPermission();
      if (!ok) {
        Alert.alert("Permission required", "Camera permission is required.");
        return;
      }

      if (!cameraRef.current) {
        Alert.alert("Camera not ready", "Camera reference is not ready.");
        return;
      }

      setLoading(true);

      let result = null;
      if (typeof cameraRef.current.takePictureAsync === "function") {
        result = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: Platform.OS === "android",
        });
      } else if (typeof cameraRef.current.takeSnapshot === "function") {
        result = await cameraRef.current.takeSnapshot({ quality: 0.8 });
      }

      navigation.replace("ProductLoading", {
        skinType,
        photoUri: result?.uri ?? null,
      });
    } catch {
      Alert.alert("Error", "Could not take photo.");
    } finally {
      setLoading(false);
    }
  }

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>We need camera permission to continue.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const ok = await ensureCameraPermission();
            if (ok) setHasPermission(true);
          }}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => navigation.goBack?.()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        HasCameraView ? (
          <ExpoCamera.CameraView
            key={cameraKey}
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          />
        ) : HasCamera ? (
          <ExpoCamera.Camera
            key={cameraKey}
            ref={cameraRef}
            style={styles.camera}
            type={type}
          />
        ) : (
          <View style={[styles.camera, styles.center]}>
            <Text style={styles.text}>No camera module available</Text>
          </View>
        )
      ) : (
        <View style={[styles.camera, styles.center]}>
          <Text style={styles.text}>Camera paused</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.goBack?.()}
        >
          <Text style={styles.controlText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleFacing}>
          <Text style={styles.iconText}>
            {facing === "back" ? "Rear" : "Front"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, loading && { opacity: 0.6 }]}
          onPress={takePhoto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureText}>TAKE</Text>
          )}
        </TouchableOpacity>

        <View style={{ width: 64 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, backgroundColor: "#222" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontSize: 16 },
  controls: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#111",
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  controlText: { color: "#fff" },
  captureButton: {
    backgroundColor: "#0a84ff",
    width: 80,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  captureText: { color: "#fff", fontWeight: "700" },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#555",
  },
  iconText: { color: "#fff", fontWeight: "700" },
  button: {
    marginTop: 12,
    backgroundColor: "#0a84ff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondary: { backgroundColor: "#444" },
});
