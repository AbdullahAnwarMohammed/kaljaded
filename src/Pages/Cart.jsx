import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import { IoIosCloudDone } from "react-icons/io";
import { useTranslation } from "react-i18next";

import { removeCartItem } from "../api/cartApi";
import { useCart } from "../context/CartContext";

import "./Cart.css";

const Cart = () => {
  const { t } = useTranslation();
  const { cart, setCart, cartCount, setCartCount, fetchCart } = useCart();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cart) {
      fetchCart().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [cart]);

  const handleRemove = async (itemId) => {
    try {
      const res = await removeCartItem(itemId);
      if (res.data.success) {
        setCart(res.data.data.cart);
        const newCount = res.data.data.cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        setCartCount(newCount);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleNext = () => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      navigate("/checkout");
    } else {
      navigate("/login-customer");
    }
  };

  if (loading) return null;

  return (
    <div className="page-carts">
      <main >
        {/* ===============================
          منتجات السلة
        =============================== */}
        {cart && cart.items.length > 0 ? (
          <section className="cart-items" id="cartItems">
            {cart.items
              .filter((item) => item.product)
              .map((item) => (
                <div className="cart-item" data-id={item.id} key={item.id}>
                  <div className="item-image">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                    />
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">{item.product?.name}</h3>

                    <div className="item-price">{item.price} K.D</div>

                    <div className="attributes">
                      {item.ramsize > 0 && (
                        <div className="attribute">{item.ramsize} RAM</div>
                      )}
                      {item.color && (
                        <div className="attribute">{item.color}</div>
                      )}
                      {item.memorysize > 0 && (
                        <div className="attribute">{item.memorysize} GB</div>
                      )}
                      <div className="attribute">
                        {item.product?.device_clean == 100
                          ? t("box_included")
                          : t("box_not_included")}
                      </div>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
          </section>
        ) : (
          /* ===============================
            السلة الفارغة
          =============================== */
          <section className="empty-cart" id="emptyCart">
            <div className="empty-cart-icon">
              <FaShoppingCart />
            </div>
            <h3>{t('cart_empty')}</h3>
            <p>{t('cart_empty_msg')}</p>
            <Link to="/" className="continue-shopping">
              {t('continue_shopping')}
            </Link>
          </section>
        )}

        {/* ===============================
          ملخص الطلب
        =============================== */}
        {cart && cart.items.length > 0 && (
          <section className="order-summary">
            <div className="summary-row summary-total">
              <span>{t('total')}:</span>
              <span>{cart.total} K.D</span>
            </div>

            <div className="info">
              <span>
                {t('wallet_note')}
              </span>
              <IoIosCloudDone />
            </div>

            <div className="sum">
              <span>{t('total')} : </span>
              <span>{cart.total} K.D</span>
            </div>

            <button
              onClick={handleNext}
              className="checkout-btn mt-4 text-center text-decoration-none"
              style={{ display: "block" }}
            >
              {t('buy_now')}
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Cart;
