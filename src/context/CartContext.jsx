import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "../api/cartApi";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const calculateCount = (cart) => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  };

  const fetchCart = async () => {
    const res = await getCart();
    if (res.data.success) {
      setCart(res.data.data.cart);
      setCartCount(calculateCount(res.data.data.cart));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        fetchCart,
        setCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
