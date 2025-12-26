import { request } from "./apiClient";

export const authApi = {
  exists({ email, username }) {
    const parts = [];
    if (email) parts.push(`email=${encodeURIComponent(email)}`);
    if (username) parts.push(`username=${encodeURIComponent(username)}`);
    const qs = parts.join("&");
    return request(`/api/auth/exists?${qs}`, { method: "GET" });
  },
  register(payload) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
