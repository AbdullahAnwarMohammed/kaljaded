import Api from "../Services/Api";

// جلب المفضلة الحالية (Guest أو User)
export const getFavorites = () => {
  return Api.get("/favorites");
};

// إضافة منتج للمفضلة
export const addToFavorites = (productId) => {
  return Api.post("/favorites/items", {
    product_id: productId,
  });
};

// إزالة منتج من المفضلة
export const removeFavoriteItem = (id) => {
  return Api.delete(`/favorites/items/${id}`);
};

// ===============================
// دمج مفضلة Guest في مفضلة المستخدم بعد تسجيل الدخول
// ===============================
export const mergeGuestFavorites = () => {
  return Api.post("/favorites/merge");
};
