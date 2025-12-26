import { authApi } from "../api/authApi";
import { clearAuth, saveAuth } from "./authStorage";

export async function registerUser(payload) {
  const data = await authApi.register(payload);
  if (data?.token && data?.user) {
    await saveAuth(data.token, data.user, data.csrfToken);
  }
  return data;
}

export async function loginUser(payload) {
  const data = await authApi.login(payload);
  if (data?.token && data?.user) {
    await saveAuth(data.token, data.user, data.csrfToken);
  }
  return data;
}

export async function logout() {
  await clearAuth();
}

