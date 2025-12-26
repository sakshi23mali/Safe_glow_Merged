import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";

// Fix for "This document requires 'TrustedHTML' assignment" error in some browser environments (like Trae preview)
if (
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  window.trustedTypes &&
  window.trustedTypes.createPolicy
) {
  if (!window.trustedTypes.defaultPolicy) {
    try {
      window.trustedTypes.createPolicy("default", {
        createHTML: (string) => string,
        createScriptURL: (string) => string,
        createScript: (string) => string,
      });
    } catch (e) {
      console.error("Failed to create Trusted Types policy", e);
    }
  }
}

import CameraScreen from "./client/features/camera/CameraScreen";
import HomeScreen from "./client/features/home/HomeScreen";
import LoginScreen from "./client/features/auth/LoginScreen";
import ProductLoadingScreen from "./client/features/products/ProductLoadingScreen";
import ProductScreen from "./client/features/products/ProductScreen";
import QuizScreen from "./client/features/quiz/QuizScreen";
import RegisterScreen from "./client/features/auth/RegisterScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#f5f5f5" },
          headerTintColor: "#333",
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Register" }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />

        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: "Take Skin Photo" }}
        />

        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: "Skin Type Quiz" }}
        />

        <Stack.Screen
          name="ProductLoading"
          component={ProductLoadingScreen}
          options={{ title: "Please Wait..." }}
        />

        <Stack.Screen
          name="Products"
          component={ProductScreen}
          options={{ title: "Product Suggestions" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}





