import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RiArrowRightLine, RiSecurePaymentLine } from "react-icons/ri";
import { FaRegEye, FaCommentAlt, FaArrowLeft, FaWindowClose, FaCalendarAlt, FaStar, FaCog, FaArrowCircleLeft } from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import { FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { MdOutlineIosShare } from "react-icons/md";

import shipping from "../../src/assets/shipping.png";
import return_image from "../../src/assets/return.png";
import hourse from "../../src/assets/hourse.png";
import deema_image from "../../src/assets/deema.png";

import "swiper/css";
import "swiper/css/navigation";

import Api from "../Services/Api";
import { useCart } from "../context/CartContext"; // استخدم context للسلة
import { addToCart, updateCartItem, removeCartItem } from "../api/cartApi";
import "./ProductDetails.css";

import { IoLogoInstagram } from "react-icons/io";
import { useTranslation } from "react-i18next";
const ProductDetails = () => {
  const { id, slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpenFixed, setIsPopupOpenFixed] = useState(false);
  const [isPopupOpenDynamic, setIsPopupOpenDynamic] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Cart context
  const { cart, fetchCart } = useCart();

  // جلب المنتج عند تحميل الصفحة
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let res;
        if (id) {
           res = await Api.get(`/products/${id}`);
        } else {
           res = await Api.get(`/products/showBySlug/${slug}`);
        }
        
        if (res.data.success) setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (id || slug) fetchProduct();
  }, [id, slug]);

  // تحقق إذا المنتج موجود بالسلة
  const cartItem = cart?.items?.find(item => item.product?.id === product?.id);

  // إضافة المنتج للسلة

  const handleAddToCart = async () => {
    if (!product || loading) return;

    setLoading(true);
    try {
      const latestCart = await fetchCart();
      const existingItem = latestCart?.items?.find(item => item.product?.id == product.id);

      if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + 1);
      } else {
        await addToCart(product.id, 1);
      }

      await fetchCart();

      // التحويل إلى صفحة السلة بعد الإضافة
      navigate("/carts");

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


  // حذف المنتج
  const handleRemove = async () => {
    if (!cartItem) return;
    setLoading(true);
    try {
      await removeCartItem(cartItem.id);
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };


const handleInstallClick = async () => {
  const token = localStorage.getItem("customer_token");
    let customer = {};
    try {
        const storedCustomer = localStorage.getItem("customer");
        if (storedCustomer && storedCustomer !== "undefined") {
            customer = JSON.parse(storedCustomer);
        }
    } catch (e) {
        console.error("Error parsing customer from localStorage", e);
    }

    const isValidToken = token && token !== "undefined" && token !== "null";

    if (!isValidToken) {
        navigate("/login-customer");
        return;
    }

  try {
    const res = await Api.post(
      "/payment/deema/checkout",
      {
        productid: product.id,
        customer_name: customer.name || "Customer",
        customer_phone: customer.phone || "00000000",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.data) {
      console.log(res.data);
      window.location.href = res.data.data.redirect_link;
    }
  } catch (err) {
    console.log(err);
    alert(t("error_occurred")); // You might want to add this key too or leave alert
  }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/product/${product.id}/${product.slug}`;
    const shareData = {
      title: product.name,
      text: `${t("share_message_start")} ${product.name}\n${t("share_message_price")} ${product.price} K.D\n`,
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

  if (!product) return <div>{t("loading")}</div>;

  const isAr = i18n.language === 'ar';

  return (
    <div className="product-details-page" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{product.name} | {t("like_new")}</title>
        <meta name="description" content={product.note || `${t("buy_now")} ${product.name}`} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.note || t("share_message_start")} />
        {product.images?.[0] && <meta property="og:image" content={product.images[0]} />}
        <meta property="og:url" content={`${window.location.origin}/product/${product.id}/${product.slug}`} />
        <meta property="og:site_name" content={t("like_new")} />
      </Helmet>

      <header className="header-product-details-page">
        <div onClick={() => navigate(-1)} className="icon-back" style={{ cursor: 'pointer' }}>
          <RiArrowRightLine style={{ transform: isAr ? 'rotate(0deg)' : 'rotate(180deg)' }} />
        </div>
        <h6>{product.name}</h6>
      </header>

      {/* Slider */}
      <div className="slider">
        <div className="icons">
          <div className="views badge bg-white text-dark">
            {product.views} <FaRegEye />
          </div>
          {product.device_clean == 100 && (
            <span className="new badge bg-danger d-flex align-items-center">
              {t("new")}
            </span>
          )}

          <div className="share">
            <div
              className="share-icon"
              onClick={handleShare}
            >
              <MdOutlineIosShare />
            </div>
            <div className="whatsapp">
              <Link 
                className="whatsapp" 
                to={product ? `https://wa.me/?text=${encodeURIComponent(`${t("whatsapp_message_start")}\n*${product.name}*\n${window.location.origin}/product/${product.id}/${product.slug}`)}` : "#"}
                target="_blank"
              >
                <FaWhatsapp />
              </Link>
            </div>
          </div>
        </div>

        {product.images && product.images.length > 0 && (
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            navigation
            modules={[Navigation]}
            dir="ltr" // Keep swiper LTR usually for images, or dynamic
          >
            {product.images.map((src, i) => (
              <SwiperSlide key={i}>
                <img src={src} alt={product.name} className="slider-img" />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="container">
        <div className="name-product">
          <h6>{product.name}</h6>
        </div>

        {/* Attributes */}
        <div className="attributes">
          {product.ramsize > 0 && <div className="attribute">{product.ramsize} {t("ram")}</div>}
          {product.color && <div className="attribute">{product.color}</div>}
          {product.memorysize > 0 && <div className="attribute">{product.memorysize} {t("gb")}</div>}
          <div className="attribute">{product.device_clean == 100 ? t("with_box") : t("without_box")}</div>
        </div>

        {/* Comment */}
        {product.note && (
          <div className="comment-vendor">
            <span><FaCommentAlt /> {t("inspector_comment")}</span>
            <p>{product.note}</p>
          </div>
        )}

        {/* Device Info */}
        {product.device_clean !== 100 && (
          <div className="items">
            <div className="item"><div>{t("device_cleanliness")}</div><div>{product.device_clean}%</div></div>
            <div className="item" onClick={() => setIsPopupOpenDynamic(true)}><div>{t("inspection_certificate")}</div><div>{t("checked")} <FaArrowLeft style={{ transform: isAr ? 'rotate(0deg)' : 'rotate(180deg)' }} /></div></div>
            <div className="item" onClick={() => setIsPopupOpenFixed(true)}><div>{t("trial_warranty")}</div><div>{t("days_3")} <FaArrowLeft style={{ transform: isAr ? 'rotate(0deg)' : 'rotate(180deg)' }} /></div></div>
            <div className="item"><div>{t("purchase_warranty")}</div><div>{t("months_3")}</div></div>
          </div>
        )}


        {/* Payments */}
        <div className="payments">
          <header>
            {product.device_clean !== 100 && (
              <button>{t("free_trial")}</button>
            )}

            <h2 className="price">{product.price}<span className="unit">K.D</span></h2>
          </header>

          <div className="payment">
            <div onClick={handleInstallClick} >{t("install_with_deema")} <img src={deema_image} width={40} alt="" /></div>

            {!cartItem ? (
              <button
                className="buy-now"
                onClick={handleAddToCart}
                disabled={loading || !cart}
              >
                {t("buy_now")}
              </button>
            ) : (
              <button
                className="remove-product-cart"
                onClick={handleGoToCart} // بدل handleRemove
                disabled={loading}
              >
                {t("product_added")}
              </button>
            )}
          </div>

          <h3>{t("payment_secured")} <RiSecurePaymentLine /></h3>
        </div>
      </div>

      {/* Popups */}
      {isPopupOpenDynamic && (
        <div className="popup-overlay-dynamic" onClick={() => setIsPopupOpenDynamic(false)}>
          <div className="popup-content-dynamic" onClick={e => e.stopPropagation()}>
            <header>
              <h3>{t("inspection_certificate")}</h3>
              <button onClick={() => setIsPopupOpenDynamic(false)}><FaArrowCircleLeft style={{ transform: isAr ? 'rotate(0deg)' : 'rotate(180deg)' }} /></button>
            </header>
            <div className="image">
              <span>{t("checked")} <IoCheckmarkDoneCircle /></span>
              <img src={product.image} alt={product.name} />
            </div>

            <div className="popup-overlay-dynamic-items">
              <div className="popup-overlay-dynamic-item">
                <h6>{t("device_type")}</h6>
                <h6>{product.name}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("device_status")}</h6>
                <h6>{product.device_status == 1 ? t("open") : t("new")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("device_cleanliness")}</h6>
                <h6>%{product.device_clean}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("scratches_body")}</h6>
                <h6>{product.device_body == 1 ? t("found") : t("not_found")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("scratches_screen")}</h6>
                <h6>{product.device_display ? t("found") : t("not_found")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("sensors_wifi")}</h6>
                <h6>{product.device_wifi_blu ?  t("working") : t("not_working")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("sensors_functions")}</h6>
                <h6>{product.device_camera ? t("working") : t("not_working")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("power_button")}</h6>
                <h6>{product.device_button ? t("working") : t("not_working")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("battery_percentage")}</h6>
                <h6>%{product.device_battery ?? ""}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("external_speaker")}</h6>
                <h6>{product.device_speaker ? t("working") : t("not_working")}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>{t("fingerprints")}</h6>
                <h6>{product.device_fingerprint ? t("working") : t("not_working")}</h6>
              </div>
            </div>
          </div>

        </div>
      )}

      {isPopupOpenFixed && (
        <div className="popup-overlay-fixed" onClick={() => setIsPopupOpenFixed(false)}>
          <div className="popup-content-fixed" onClick={e => e.stopPropagation()}>
            <header><h2>{t("trial_warranty")}</h2></header>
            <h4>{t("how_trial_works")}</h4>
            <div className="items-descrption">
              <div className="item-descrption"><FaCalendarAlt className="icon" /><div><h6>{t("purchase_day")}</h6><p>{t("purchase_day_desc")}</p></div></div>
              <div className="item-descrption"><FaStar className="icon" /><div><h6>{t("day_3")}</h6><p>{t("day_3_desc")}</p></div></div>
              <div className="item-descrption"><FaCog className="icon" /><div><h6>{t("day_4")}</h6><p>{t("day_4_desc")}</p></div></div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setIsPopupOpenFixed(false)}>{t("close")} <FaWindowClose /></button>
          </div>
        </div>
      )}


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

export default ProductDetails;
