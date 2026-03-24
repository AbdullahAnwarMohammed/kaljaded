import { FaRegHeart, FaHeart, FaRegEye } from "react-icons/fa";
import { RiStore2Line } from "react-icons/ri";
import { BsFillGiftFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LazyImage from "../LazyImage/LazyImage";
import { addToCart } from "../../api/cartApi";
import { useCart } from "../../context/CartContext";
import React, { useState } from "react";
import "./CategorySection.css";

const ProductCard = React.memo(({ p, showFastBadge = false, isSold = false }) => {
  const { t } = useTranslation();
  if (!p) return null;
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
    if (isSold) return;
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

  const productLink = isSold ? "#" : `/product/${p.id}/${p.slug}`;

  return (
    <div className={`product-card ${isSold ? 'sold-out' : ''}`}>
      <div className="image" style={{ overflow: "hidden", position: "relative" }}>
        <Link to={productLink} onClick={(e) => isSold && e.preventDefault()}>
          <LazyImage
            src={images[0]} // أول صورة فقط
            alt={p.name}
            style={{
              width: "100%",
              borderRadius: "10px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
              filter: isSold ? "grayscale(1)" : "none"
            }}
          />
        </Link>

        {!isSold && (
          <span className="count-show badge bg-white text-dark">
            {p.views} <FaRegEye />
          </span>
        )}

        {shouldShowFastBadge && !isSold && (
             <span className="badge bg-warning text-dark" style={{ position: 'absolute', top: '12px', left: '10px', fontSize: '10px' }}>
                 Fast
             </span>
        )}

        <div className="info">
          {p.device_clean === 100 && !isSold && <div className="new">جديد</div>}
          {p.gift && !isSold && (
            <div className="gift">
              <BsFillGiftFill />
            </div>
          )}
        </div>
        
        {/* {isSold && (
          <div className="sold-label" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '5px',
            fontWeight: 'bold',
            fontSize: '14px',
            zIndex: 2,
            border: '2px solid white'
          }}>
            {t("product_sold")}
          </div>
        )} */}
      </div>


      <div className="content">
        <Link to={productLink} onClick={(e) => isSold && e.preventDefault()}>
          <p className="product-name" title={p.name}>{p.name}</p>
        </Link>
        <div className="badge-container">
          {p.device_clean !== 100 && (
            <div
              className="info-one"
              style={{
                background: `linear-gradient(to left, #afffb3 ${p.device_clean}%, #eee ${p.device_clean}%)`,
                width: '100%'
              }}
            >
              <h6>{t("like_new")}</h6>
              <p>{p.device_clean}%</p>
            </div>
          )}
        </div>
        <div className="info-two">
          <p>K.D {p.price}</p>
          {p.merchant_name && isSold && (
             <div className="merchant-info">
                <Link to={`/merchants/${p.merchant_slug}`} className="merchant-link" onClick={(e) => isSold && e.preventDefault()}>
                   <RiStore2Line style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                   {p.merchant_name}
                </Link>
             </div>
          )}
          {p.price_active && !isSold ? <p>{t("available_installments")}</p> : ""}
        </div>

        {p.price_active && !isSold ? (
          <Link to={productLink}>
            <p className="try-free">{shouldShowFastBadge ? t("fast_sale") : t("try_free")}</p>
          </Link>
        ) : (
          <p 
            className="buy-now" 
            onClick={handleBuyNow} 
            style={{ 
              cursor: (loading || isSold) ? "wait" : "pointer", 
              opacity: (loading || isSold) ? 0.7 : 1,
              background: isSold ? "#6c757d" : (isInCart ? "#28a745" : "") 
            }}
          >
            {isSold 
              ? t("product_sold")
              : loading 
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
