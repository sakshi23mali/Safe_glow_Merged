import { getCsrfToken, getToken } from "../auth/authStorage";
import { API_BASE_URL } from "../config/env";

async function parseJsonOrNull(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[API Request] ${options.method || "GET"} ${url}`);

  const csrfToken = await getCsrfToken();
  const headers = {
    "Content-Type": "application/json",
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(url, { ...options, headers });
    console.log(`[API Response Status] ${res.status} for ${url}`);
  } catch (err) {
    console.error(`[API Fetch Error] ${err.message} for ${url}`);
    const networkErr = new Error(
      `Cannot reach the server. Check API base URL and network connectivity. (${API_BASE_URL})`
    );
    networkErr.status = 0;
    throw networkErr;
  }
  const data = await parseJsonOrNull(res);
  if (data) console.log(`[API Response Data]`, data);

  if (!res.ok) {
    const message =
      data?.message || data?.error || data?.msg || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function requestWithAuth(path, options = {}) {
  const token = await getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return request(path, { ...options, headers });
}
