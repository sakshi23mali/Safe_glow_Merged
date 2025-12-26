import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "safeglow_token";
const USER_KEY = "safeglow_user";
const CSRF_KEY = "safeglow_csrf";

export async function saveAuth(token, user, csrfToken) {
  const pairs = [
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ];
  if (csrfToken) {
    pairs.push([CSRF_KEY, csrfToken]);
  }
  await AsyncStorage.multiSet(pairs);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getCsrfToken() {
  return AsyncStorage.getItem(CSRF_KEY);
}

export async function getUser() {
  const value = await AsyncStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, CSRF_KEY]);
}

