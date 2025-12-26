import axios from "axios";
import { getLoadingSetter } from "./LoadingHelper";
import { getGuestToken } from "../utils/guestToken";
import i18n from "../i18n";

const Api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
Api.interceptors.request.use(
  (config) => {
    const setLoading = getLoadingSetter();
    if (setLoading) setLoading(true);

    const customerToken = localStorage.getItem("customer_token");

    if (customerToken) {
      // مستخدم مسجّل دخول
      config.headers["Authorization"] = `Bearer ${customerToken}`;
      delete config.headers["X-Guest-Token"];
    } else {
      // Guest
      const guestToken = getGuestToken();
      config.headers["X-Guest-Token"] = guestToken;
    }

    // إضافة لغة المستخدم
    config.headers["language"] = i18n.language || "en";;

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
    const setLoading = getLoadingSetter();
    if (setLoading) setLoading(false);
    return response;
  },
  error => {
    const setLoading = getLoadingSetter();
    if (setLoading) setLoading(false);
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default Api;
