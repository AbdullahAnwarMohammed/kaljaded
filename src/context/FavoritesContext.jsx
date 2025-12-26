import React, { createContext, useState, useEffect } from "react";
import {
  getFavorites,
  addToFavorites,
  removeFavoriteItem
} from "../api/favoritesApi";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب المفضلة عند تحميل التطبيق
  const fetchFavorites = async () => {
    try {
      const res = await getFavorites();
      const items = res?.data?.data?.favorite?.items || [];
      setFavorites(items);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // إضافة منتج إلى المفضلة
  const addFavorite = async (productId) => {
    try {
      await addToFavorites(productId);

      // إعادة الجلب لضمان التزامن مع السيرفر
      await fetchFavorites();
    } catch (error) {
      console.error("Failed to add favorite:", error);
    }
  };

  // إزالة منتج من المفضلة
  const removeFavorite = async (favoriteItemId) => {
    try {
      await removeFavoriteItem(favoriteItemId);

      // تحديث محلي آمن (السيرفر لا يعيد عناصر هنا)
      setFavorites((prev) =>
        prev.filter((item) => item.id !== favoriteItemId)
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addFavorite,
        removeFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
