import axios from "axios";
import { getLoadingSetter } from "./LoadingHelper";
import { getGuestToken } from "../utils/guestToken";
import i18n from "../i18n";

const Api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
// Basic in-memory cache
const apiCache = new Map();

// Request interceptor
Api.interceptors.request.use(
  (config) => {
    // Check if skipLoader is true in the config
    if (!config.skipLoader) {
      const setLoading = getLoadingSetter();
      if (setLoading) setLoading(true);
    }

    // Cache Implementation
    if (config.method === 'get' && config.cache) {
        const key = config.url + JSON.stringify(config.params || {});
        const cachedResponse = apiCache.get(key);
        if (cachedResponse) {
            // Serve from cache
            config.adapter = () => Promise.resolve({
                data: cachedResponse,
                status: 200,
                statusText: 'OK',
                headers: config.headers,
                config,
                request: {}
            });
            // Don't skip loader if we emulate network request, but we can speed it up. 
            // Actually, if cached, we might want to skip loader or show it very briefly?
            // Let's leave loader logic as is, it will just flip fast.
        }
    }
    
    const customerToken = localStorage.getItem("customer_token");
    const guestToken = getGuestToken();

    if (customerToken && customerToken !== "undefined" && customerToken !== "null") {
      config.headers["Authorization"] = `Bearer ${customerToken}`;
    }
    
    // Always send guest token if available
    if (guestToken) {
      config.headers["X-Guest-Token"] = guestToken;
    }

    config.headers["language"] = i18n.language || "en";

    return config;
  },
  (error) => {
    const setLoading = getLoadingSetter();
    if (setLoading) setLoading(false);
    return Promise.reject(error);
  }
);


// Response interceptor
Api.interceptors.response.use(
  response => {
    if (!response.config.skipLoader) {
        const setLoading = getLoadingSetter();
        if (setLoading) setLoading(false);
    }
    
    // Cache Save
    if (response.config.method === 'get' && response.config.cache) {
        const key = response.config.url + JSON.stringify(response.config.params || {});
        apiCache.set(key, response.data);
    }

    return response;
  },
  error => {
    // Only turn off loader if it wasn't skipped (though turning it off extra times is safe)
    const setLoading = getLoadingSetter();
    if (setLoading) setLoading(false);
    
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default Api;
