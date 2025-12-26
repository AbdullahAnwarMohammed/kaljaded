import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaTrash } from "react-icons/fa";

import {
    getFavorites,
    removeFavoriteItem
} from "../api/favoritesApi";

import "./Fav.css";

const Fav = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===============================
    // تحميل المفضلة
    // ===============================
    useEffect(() => {
        getFavorites()
            .then((res) => {
                if (res.data.success) {
                    const items = res?.data?.data?.favorite?.items || [];
                    setFavorites(items);
                }
            })
            .finally(() => setLoading(false));
    }, []);


    const handleRemove = (favoriteItemId) => {
        removeFavoriteItem(favoriteItemId).then((res) => {
            if (res.data.success) {
                setFavorites((prev) =>
                    prev.filter((item) => item.id !== favoriteItemId)
                );
            }
        });
    };

    if (loading) return null;

    return (
        <main className="container">
            {favorites.length > 0 ? (
                <section className="fav-items">
                    {favorites.map((item) => (
                        <div className="fav-item" key={item.id}>
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
                                    {item.product.price} د.ك
                                </div>

                                <div className="item-actions">
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemove(item.id)}
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
                    المفضلة فارغة
                =============================== */
                <section className="empty-fav">
                    <div className="empty-fav-icon">
                        <FaHeart />
                    </div>
                    <h3>المفضلة فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
                    <Link to="/" className="continue-shopping">
                        مواصلة التسوق
                    </Link>
                </section>
            )}
        </main>
    );
};

export default Fav;
