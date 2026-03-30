import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RiArrowRightLine, RiSecurePaymentLine, RiShoppingCartLine } from "react-icons/ri";
import { FaRegEye, FaWhatsapp } from "react-icons/fa";
import { MdOutlineIosShare } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useTranslation } from "react-i18next";

import Api from "../Services/Api";
import { useCart } from "../context/CartContext";
import { addToCart, updateCartItem } from "../api/cartApi";

import "swiper/css";
import "swiper/css/navigation";
import "./ProductDetails.css"; // Reuse existing styles

import shipping from "../../src/assets/shipping.png";
import return_image from "../../src/assets/return.png";
import hourse from "../../src/assets/hourse.png";
import { FaTiktok } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io";

const AccessoryDetails = () => {
  const { identifier } = useParams();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { cart, fetchCart } = useCart();

  useEffect(() => {
    const fetchAccessory = async () => {
      try {
        const res = await Api.get(`/accessories/${identifier}`);
        if (res.data.success) {
          setAccessory(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (identifier) fetchAccessory();
  }, [identifier]);

  const cartItem = cart?.items?.find(item => item.accessory?.id === accessory?.id);

  const handleAddToCart = async () => {
    if (!accessory || loading) return;

    setLoading(true);
    try {
      const latestCart = await fetchCart();
      const existingItem = latestCart?.items?.find(item => item.accessory?.id === accessory.id);

      if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + 1);
      } else {
        // Need to update addToCart to support accessory_id
        await Api.post("/cart/items", { accessory_id: accessory.id, quantity: 1 });
      }

      await fetchCart();
      // Stay on current page for accessories
    } catch (err) {
      console.error(err);
      alert(t("error_occurred") || "Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCart = () => {
    navigate("/carts");
  };

  const handleShare = async () => {
    if (!accessory) return;
    const shareUrl = `${window.location.origin}/accessory/${accessory.slug || accessory.id}`;
    const shareData = {
      title: accessory.name,
      text: `${t("share_message_start")} ${accessory.name}\n${t("share_message_price")} ${accessory.price} K.D\n`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      const textToCopy = `${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert(t("share_link_success")))
        .catch(() => alert(t("share_link_failed")));
    }
  };

  if (!accessory) return <div>{t("loading")}</div>;

  const isAr = i18n.language === 'ar';

  return (
    <div className="product-details-page" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{accessory.name} | {t("like_new")}</title>
      </Helmet>

      <header className="header-product-details-page">
        <div onClick={() => navigate(-1)} className="icon-back" style={{ cursor: 'pointer' }}>
          <RiArrowRightLine style={{ transform: isAr ? 'rotate(0deg)' : 'rotate(180deg)' }} />
        </div>
        <h6>{accessory.name}</h6>
      </header>

      <div className="slider">
        <div className="icons">
          <div className="views badge bg-white text-dark">
            0 <FaRegEye />
          </div>
          {accessory.status === 'new' && (
            <span className="new badge bg-danger d-flex align-items-center">
              {t("new")}
            </span>
          )}

          <div className="share">
            <div className="share-icon" onClick={handleShare}>
              <MdOutlineIosShare />
            </div>
            <div className="whatsapp">
              <Link
                className="whatsapp"
                to={`https://wa.me/?text=${encodeURIComponent(`${t("whatsapp_message_start")}\n*${accessory.name}*\n${window.location.origin}/accessory/${accessory.slug || accessory.id}`)}`}
                target="_blank"
              >
                <FaWhatsapp />
              </Link>
            </div>
          </div>
        </div>

        {accessory.images && accessory.images.length > 0 && (
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            navigation
            modules={[Navigation]}
            dir="ltr"
          >
            {accessory.images.map((src, i) => (
              <SwiperSlide key={i}>
                <img src={src} alt={accessory.name} className="slider-img" />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="container">
        <div className="name-product">
          <h6>{accessory.name}</h6>
        </div>

        {accessory.description && (
          <div className="comment-vendor">
            <span>{t("description")}</span>
            <p>{accessory.description}</p>
          </div>
        )}

        <div className="payments">
          <header>
            {accessory.discount > 0 ? (
              <div className="accessory-pricing-main">
                <h2 className="price discounted">{accessory.discount}<span className="unit">K.D</span></h2>
                <div className="price-old">{accessory.price} K.D</div>
              </div>
            ) : (
              <h2 className="price">{accessory.price}<span className="unit">K.D</span></h2>
            )}
          </header>

          <div className="payment">
            {!cartItem ? (
              <button
                className="buy-now"
                onClick={() => handleAddToCart()}
                disabled={loading || !cart}
              >
                {t("add_to_cart_and_continue_shopping")}
              </button>
            ) : (
              <button
                className="remove-product-cart"
                onClick={handleGoToCart}
                disabled={loading}
              >
                {t("cart")} <RiShoppingCartLine />
              </button>
            )}
          </div>
          <h3>{t("payment_secured")} <RiSecurePaymentLine /></h3>
        </div>

        {/* Similar Products Slider */}
        {accessory.products && accessory.products.length > 0 && (
          <div className="similar-accessories-section">
            <header className="accessories-header">
              <h3>{t("products")}</h3>
              <Link to="/products" className="view-all">
                {t("view_all")} <RiArrowRightLine style={{ transform: isAr ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </Link>
            </header>

            <Swiper
              spaceBetween={15}
              slidesPerView={2.2}
              breakpoints={{
                640: { slidesPerView: 3.2 },
                768: { slidesPerView: 4.2 },
                1024: { slidesPerView: 5.2 },
              }}
              dir={isAr ? "rtl" : "ltr"}
            >
              {accessory.products.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link to={`/product/${product.id}/${product.slug}`} className="accessory-card-link" style={{ textDecoration: 'none' }}>
                    <div className="accessory-card">
                      <div className="image-container">
                        <img 
                          src={product.image || "/placeholder-product.png"} 
                          alt={product.name} 
                        />
                      </div>
                      
                      <div className="accessory-info">
                        <h4 className="accessory-name">{product.name}</h4>
                        <div className="accessory-pricing">
                           <div className="accessory-price">
                              {product.price} <span>K.D</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <div className="shipping-detials">
        <div className="item">
          <img src={shipping} alt="" />
          <h4>{t("fast_shipping")}</h4>
        </div>
        <div className="item">
          <img src={hourse} alt="" />
          <h4>{t("continuous_support")}</h4>
        </div>
        <div className="item">
          <img src={return_image} alt="" />
          <h4>{t("return_warranty")}</h4>
        </div>
      </div>

      <div className="account-social-media">
        <h6>{t("social_media_accounts")}</h6>
        <div className="icons">
          <Link to="">
            <FaTiktok />
          </Link>
          <Link to="">
            <IoLogoInstagram />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessoryDetails;
