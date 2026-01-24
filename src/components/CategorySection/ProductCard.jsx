import { FaRegHeart, FaHeart, FaRegEye } from "react-icons/fa";
import { BsFillGiftFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LazyImage from "../LazyImage/LazyImage";
import { addToCart } from "../../api/cartApi";
import { useCart } from "../../context/CartContext";
import React, { useState } from "react";
import "./CategorySection.css";

const ProductCard = React.memo(({ p, showFastBadge = false }) => {
  const { t } = useTranslation();
  const images = p.images && p.images.length ? p.images : [p.image];
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Check if product is already in cart
  const isInCart = cart?.items?.some((item) => item?.product?.id === p?.id);

  // Check if product is fast (within 1 hour)
  const isFast = () => {
      if (p.fast_by !== 1) return false;
      if (!p.date) return false;

      const productDate = new Date(p.date); 
      const now = new Date();
      const diffInMs = now - productDate;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      return diffInHours <= 1;
  };

  const shouldShowFastBadge = showFastBadge && isFast();

  const handleBuyNow = async () => {
    const token = localStorage.getItem("customer_token");

    if (!token) {
      navigate("/login-customer");
      return;
    }

    if (isInCart) {
      navigate("/carts");
      return;
    }

    setLoading(true);
    try {
      const res = await addToCart(p.id, 1);
      if (res.data.success) {
        await fetchCart();
        navigate("/carts");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      <div className="image" style={{ overflow: "hidden", position: "relative" }}>
        <Link to={`/product/${p.id}/${p.slug}`}>
          <LazyImage
            src={images[0]} // أول صورة فقط
            alt={p.name}
            style={{
              width: "100%",
              borderRadius: "10px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          />
        </Link>

        <span className="count-show badge bg-white text-dark">
          {p.views} <FaRegEye />
        </span>

        {shouldShowFastBadge && (
             <span className="badge bg-warning text-dark" style={{ position: 'absolute', top: '12px', left: '10px', fontSize: '10px' }}>
                 Fast
             </span>
        )}

        <div className="info">
          {p.device_clean === 100 && <div className="new">جديد</div>}
          {p.gift && (
            <div className="gift">
              <BsFillGiftFill />
            </div>
          )}
        </div>
      </div>


      <div className="content">
        <Link to={`/product/${p.id}/${p.slug}`}>
          <p className="product-name" title={p.name}>{p.name}</p>

        </Link>
        {p.device_clean !== 100 && (
          <div
            className="info-one"
            style={{
              background: `linear-gradient(to left, #afffb3 ${p.device_clean}%, #eee ${p.device_clean}%)`,
            }}
          >
            <h6>{t("like_new")}</h6>
            <p>{p.device_clean}%</p>
          </div>
        )}
        <div className="info-two">
          <p>K.D {p.price}</p>
          {p.price_active ? <p>{t("available_installments")}</p> : ""}
        </div>

        {p.price_active ? (
          <Link to={`/product/${p.id}/${p.slug}`}>
            <p className="try-free">{shouldShowFastBadge ? t("fast_sale") : t("try_free")}</p>
          </Link>
        ) : (
          <p 
            className="buy-now" 
            onClick={handleBuyNow} 
            style={{ 
              cursor: loading ? "wait" : "pointer", 
              opacity: loading ? 0.7 : 1,
              background: isInCart ? "#28a745" : "" 
            }}
          >
            {loading 
              ? t("loading") 
              : isInCart 
                ? t("product_added") 
                : t("buy_now")
            }
          </p>
        )}
      </div>
    </div>
  );
});

export default ProductCard;
