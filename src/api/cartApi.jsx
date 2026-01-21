import Api from "../Services/Api";
import { getGuestToken } from "../utils/guestToken";

// جلب السلة الحالية (Guest أو User)
export const getCart = () => {
  return Api.get("/cart");
};

// إضافة منتج للسلة
export const addToCart = (productId, quantity = 1) => {
  return Api.post("/cart/items", {
    product_id: productId,
    quantity,
  });
};

// تحديث كمية منتج في السلة
export const updateCartItem = (id, quantity) => {
  return Api.put(`/cart/items/${id}`, {
    quantity,
  });
};

// إزالة منتج من السلة
export const removeCartItem = (id) => {
  return Api.delete(`/cart/items/${id}`);
};

// ===============================
// دمج سلة Guest في سلة المستخدم بعد تسجيل الدخول
// ===============================
export const mergeGuestCart = () => {
  const guestToken = getGuestToken(); // جلب أو توليد الـ token
  return Api.post(
    "/cart/merge",
    {}, // body فاضية لو مش محتاج ترسل بيانات
    {
      headers: {
        "X-Guest-Token": guestToken, // إرسال الـ guest token
      },
    }
  );
};
