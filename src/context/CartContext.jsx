import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "../api/cartApi";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const calculateCount = (cart) => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const fetchCart = async () => {
    try {
      const res = await getCart({ skipLoader: true });
      if (res.data.success) {
        setCart(res.data.data.cart);
        setCartCount(calculateCount(res.data.data.cart));
        return res.data.data.cart;
      }
    } catch (err) {
      console.log(err);
    }
    return null;
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const value = React.useMemo(() => ({
    cart,
    setCart,
    cartCount,
    setCartCount,
    fetchCart,
  }), [cart, cartCount]); // calculateCount is internal, not needed in deps if fetchCart is stable

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
