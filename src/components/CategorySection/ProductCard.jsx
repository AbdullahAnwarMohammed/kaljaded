import React, { useState, useEffect, useContext } from "react";
import { FaRegHeart, FaHeart, FaRegEye } from "react-icons/fa";
import { BsFillGiftFill } from "react-icons/bs";
import { Link } from "react-router-dom";
// import { FavoritesContext } from "../../context/FavoritesContext";
import { useTranslation } from "react-i18next";

const ProductCard = ({ p }) => {
  // const { favorites, addFavorite, removeFavorite } =
    // useContext(FavoritesContext);
  const { t } = useTranslation();
  // console.log(p);
  const images = p.images && p.images.length ? p.images : [p.image];
  const [currentImg, setCurrentImg] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hover, setHover] = useState(false);
  // ===== Favorite logic =====
  // const favItem = favorites.find((item) => item.product.id === p.id);
  // const isFavorite = Boolean(favItem);
  // const toggleFavorite = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (isFavorite && favItem) {
  //     removeFavorite(favItem.id);
  //   } else {
  //     addFavorite(p.id);
  //   }
  // };



  // ===== Image slider =====
  useEffect(() => {
    if (!hover || dragStart !== null) return;
    const interval = setInterval(() => {
      setCurrentImg((prev) =>
        prev + 1 < images.length ? prev + 1 : 0
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [hover, dragStart, images.length]);

  const startDrag = (x) => {
    setDragStart(x);
    setIsAnimating(false);
  };

  const dragMove = (x) => {
    if (dragStart !== null) setOffsetX(x - dragStart);
  };

  const endDrag = () => {
    if (dragStart === null) return;
    if (offsetX > 50 && currentImg > 0) setCurrentImg(currentImg - 1);
    else if (offsetX < -50 && currentImg < images.length - 1)
      setCurrentImg(currentImg + 1);

    setIsAnimating(true);
    setOffsetX(0);
    setDragStart(null);
  };

  return (
    <div className="product-card">
      <div
        className="image"
        style={{ overflow: "hidden", position: "relative", touchAction: "none" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          endDrag();
        }}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => {
          if (dragStart !== null) {
            e.preventDefault();
            dragMove(e.clientX);
          }
        }}
        onMouseUp={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => {
          if (dragStart !== null) dragMove(e.touches[0].clientX);
        }}
        onTouchEnd={endDrag}
      >
        <Link to={`product/${p.slug}`}>
          <img
            src={images[currentImg]}
            alt={p.name}
            style={{
              width: "100%",
              transform: `translateX(${offsetX}px)`,
              transition: isAnimating ? "0.25s ease" : "none",
            }}
          />
        </Link>

        {/* <span
          className="favorite-icon"
          onClick={toggleFavorite}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            fontSize: "1.5rem",
            color: isFavorite ? "red" : "white",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </span> */}

        <span className="count-show badge bg-white text-dark">
          {p.views} <FaRegEye />
        </span>

        <div className="info">
          {p.device_clean === 100 && <div className="new">جديد</div>}
          {p.gift && (
            <div className="gift">
              <BsFillGiftFill />
            </div>
          )}
        </div>
      </div>

      <p className="product-name">{p.name}</p>
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
        {p.price_active && <p>{t("available_installments")}</p>}
      </div>

      {p.price_active ? (
        <a className="try-free">{t("try_free")}</a>
      ) : (
        <a className="buy-now">{t("buy_now")}</a>
      )}
    </div>
  );
};

export default ProductCard;
