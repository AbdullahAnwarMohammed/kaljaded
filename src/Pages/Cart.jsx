import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaShoppingCart,
    FaPlus,
    FaMinus,
    FaTrash
} from "react-icons/fa";

import {
    getCart,
    updateCartItem,
    removeCartItem
} from "../api/cartApi";

import "./Cart.css";

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    // ===============================
    // تحميل السلة
    // ===============================
    useEffect(() => {
        getCart()
            .then((res) => {
                if (res.data.success) {
                    setCart(res.data.data.cart);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // ===============================
    // زيادة الكمية
    // ===============================
    const handleIncrease = (item) => {
        updateCartItem(item.id, item.quantity + 1)
            .then((res) => {
                if (res.data.success) {
                    setCart(res.data.data.cart);
                }
            });
    };

    // ===============================
    // تقليل الكمية
    // ===============================
    const handleDecrease = (item) => {
        if (item.quantity === 1) return;

        updateCartItem(item.id, item.quantity - 1)
            .then((res) => {
                if (res.data.success) {
                    setCart(res.data.data.cart);
                }
            });
    };

    // ===============================
    // حذف منتج
    // ===============================
    const handleRemove = (itemId) => {
        removeCartItem(itemId)
            .then((res) => {
                if (res.data.success) {
                    setCart(res.data.data.cart);
                }
            });
    };

    if (loading) return null;

    return (
        <main className="container">
            {/* ===============================
                منتجات السلة
            =============================== */}
            {cart && cart.items.length > 0 ? (
                <section className="cart-items" id="cartItems">
                    {cart.items.map((item) => (
                        <div
                            className="cart-item"
                            data-id={item.id}
                            key={item.id}
                        >
                            <div className="item-image">
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                />
                            </div>

                            <div className="item-details">
                                <h3 className="item-title">
                                    {item.product.name}
                                </h3>

                                <div className="item-price">
                                    {item.price} د.ك
                                </div>

                                <div className="item-actions">
                                    <div className="quantity-control">
                                        <button
                                            className="quantity-btn minus"
                                            disabled={item.quantity === 1}
                                            onClick={() =>
                                                handleDecrease(item)
                                            }
                                        >
                                            <FaMinus />
                                        </button>

                                        <span className="quantity">
                                            {item.quantity}
                                        </span>

                                        <button
                                            className="quantity-btn plus"
                                            onClick={() =>
                                                handleIncrease(item)
                                            }
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    <button
                                        className="remove-btn"
                                        onClick={() =>
                                            handleRemove(item.id)
                                        }
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
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
                    <h3>سلة التسوق فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
                    <Link to="/" className="continue-shopping">
                        مواصلة التسوق
                    </Link>
                </section>
            )}

            {/* ===============================
                ملخص الطلب
            =============================== */}
            {cart && cart.items.length > 0 && (
                <section className="order-summary">
                    <h3 className="summary-title">ملخص الطلب</h3>

                    <div className="summary-row summary-total">
                        <span>الإجمالي</span>
                        <span>{cart.total} د.ك</span>
                    </div>

                    <button className="checkout-btn mt-4">
                        إتمام الشراء
                    </button>
                </section>
            )}
        </main>
    );
};

export default Cart;
