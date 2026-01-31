import axios from "axios";
import { getLoadingSetter } from "./LoadingHelper";
import { getGuestToken } from "../utils/guestToken";
import i18n from "../i18n";

const Api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor
// Basic in-memory cache
const apiCache = new Map();

// Request interceptor
Api.interceptors.request.use(
  (config) => {
    // 1. Cache Implementation Check FIRST
    let isCached = false;
    if (config.method === 'get' && config.cache) {
        const key = config.url + JSON.stringify(config.params || {});
        const cachedResponse = apiCache.get(key);
        if (cachedResponse) {
            isCached = true;
            config.adapter = () => Promise.resolve({
                data: cachedResponse,
                status: 200,
                statusText: 'OK',
                headers: config.headers,
                config,
                request: {}
            });
        }
    }

    // 2. Decide whether to show loader
    // Skip loader if skipLoader is true OR if we have the data in cache
    if (!config.skipLoader && !isCached) {
      const setLoading = getLoadingSetter();
      if (setLoading) setLoading(true);
    }
    
    // Always store whether it was cached/skipped for the response interceptor
    if (isCached) config.skipLoader = true;
    
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
