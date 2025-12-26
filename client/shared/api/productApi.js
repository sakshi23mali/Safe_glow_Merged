import { requestWithAuth } from "./apiClient";

export const productApi = {
  recommend(skinType) {
    return requestWithAuth(
      `/api/products/recommend?skinType=${encodeURIComponent(String(skinType))}`
    );
  },
};

