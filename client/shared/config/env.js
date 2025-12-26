import Constants from "expo-constants";

function normalizeBaseUrl(url) {
  if (!url) return url;
  return String(url).replace(/\/+$/, "");
}

function getHostFromExpo() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) return null;

  const cleaned = String(hostUri)
    .replace(/^https?:\/\//, "")
    .replace(/\/.*/, "");

  const host = cleaned.split(":")[0];
  return host || null;
}

function inferApiBaseUrl() {
  const explicit = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  if (explicit) return explicit;

  const host = getHostFromExpo();
  if (host && host !== "localhost") {
    return `http://${host}:4000`;
  }

  return "http://localhost:4000";
}

export const API_BASE_URL = inferApiBaseUrl();
