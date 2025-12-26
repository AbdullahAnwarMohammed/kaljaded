import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RiArrowRightLine, RiSecurePaymentLine } from "react-icons/ri";
import { FaRegEye, FaCommentAlt, FaShareAltSquare, FaWhatsappSquare, FaArrowLeft, FaWindowClose, FaCalendarAlt, FaStar, FaCog, FaArrowCircleLeft } from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { MdLocalShipping } from "react-icons/md";
import { IoMdClock } from "react-icons/io";
import { SiMoneygram } from "react-icons/si";

import "swiper/css";
import "swiper/css/navigation";

import Api from "../Services/Api";
import { useCart } from "../context/CartContext"; // استخدم context للسلة
import { addToCart, updateCartItem, removeCartItem } from "../api/cartApi";
import "./ProductDetails.css";
import { AiFillTikTok } from "react-icons/ai";
import { FaSquareInstagram } from "react-icons/fa6";

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpenFixed, setIsPopupOpenFixed] = useState(false);
  const [isPopupOpenDynamic, setIsPopupOpenDynamic] = useState(false);

  // Cart context
  const { cart, fetchCart } = useCart();

  // جلب المنتج عند تحميل الصفحة
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await Api.get(`/products/showBySlug/${slug}`);
        if (res.data.success) setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [slug]);

  // تحقق إذا المنتج موجود بالسلة
  const cartItem = cart?.items?.find(item => item.product.id === product?.id);

  // إضافة المنتج للسلة
  const handleAddToCart = async () => {
    if (!product || loading) return;

    setLoading(true);
    try {
      // جلب السلة الأخيرة من الباكيند قبل الإضافة
      await fetchCart();
      const existingItem = cart?.items?.find(item => item.product.id === product.id);

      if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + 1);
      } else {
        await addToCart(product.id, 1);
      }

      await fetchCart();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // زيادة الكمية
  const handleIncrease = async () => {
    if (!cartItem) return;
    setLoading(true);
    try {
      await updateCartItem(cartItem.id, cartItem.quantity + 1);
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // تقليل الكمية
  const handleDecrease = async () => {
    if (!cartItem || cartItem.quantity === 1) return;
    setLoading(true);
    try {
      await updateCartItem(cartItem.id, cartItem.quantity - 1);
      await fetchCart();
    } finally {
      setLoading(false);
    }
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

  if (!product) return <div>جارٍ التحميل...</div>;

  return (
    <div className="product-details-page">
      <header className="header-product-details-page">
        <Link to="/" className="icon-back">
          <RiArrowRightLine />
        </Link>
        <h6>{product.name}</h6>
      </header>

      {/* Slider */}
      <div className="slider">
        <div className="icons">
          <div className="views badge bg-white text-dark">
            {product.views} <FaRegEye />
          </div>
          <div className="share">
  <div
    className="share-icon"
    onClick={() => {
      if (product) {
        const textToCopy = `شاهد هذا المنتج: ${window.location.href}\nصورة المنتج: ${product.images[0]}`;
        navigator.clipboard.writeText(textToCopy)
          .then(() => alert("تم نسخ رابط المنتج مع الصورة!"))
          .catch(err => console.error("فشل النسخ:", err));
      }
    }}
  >
    Share <FaShareAltSquare />
  </div>
  <Link className="whatsapp" to={`https://wa.me/?text=${encodeURIComponent(`شاهد هذا المنتج: ${window.location.href}\nصورة المنتج: ${product.images[0]}`)}`}>
    <FaWhatsappSquare />
  </Link>
</div>
        </div>

        {product.images && product.images.length > 0 && (
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            navigation
            modules={[Navigation]}
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
          {product.ramsize > 0 && <div className="attribute">{product.ramsize} RAM</div>}
          {product.color && <div className="attribute">{product.color}</div>}
          {product.memorysize > 0 && <div className="attribute">{product.memorysize} GB</div>}
          <div className="attribute">{product.device_box ? "معا كارتون" : "بدون كارتون"}</div>
        </div>

        {/* Comment */}
        {product.note && (
          <div className="comment-vendor">
            <span><FaCommentAlt /> تعليق الفاحص</span>
            <p>{product.note}</p>
          </div>
        )}

        {/* Device Info */}
        <div className="items">
          <div className="item"><div>نظافة الجهاز</div><div>{product.device_clean}%</div></div>
          <div className="item" onClick={() => setIsPopupOpenDynamic(true)}><div>شهادة الفحص</div><div>تم الفحص <FaArrowLeft /></div></div>
          <div className="item" onClick={() => setIsPopupOpenFixed(true)}><div>ضمان تجربة وإرجاع</div><div>3 أيام <FaArrowLeft /></div></div>
          <div className="item"><div>كفالة عند الشراء</div><div>3 شهور</div></div>
        </div>

        {/* Payments */}
        <div className="payments">
          <header>
            <button>تجربة مجانية 3 أيام</button>
            <h2 className="price">{product.price}<span className="unit">K.D</span></h2>
          </header>

          <div className="payment">
            <Link>قسط جهازك مع ديمة</Link>
            {/* 
            {!cartItem ? (
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={loading || !cart}
              >
                اضف للسلة
              </button>) : (
              <div className="quantity-controls">
                <button className="btn btn-primary" onClick={handleDecrease} disabled={loading || cartItem.quantity === 1}>-</button>
                <span>{cartItem.quantity}</span>
                <button className="btn btn-primary" onClick={handleIncrease} disabled={loading}>+</button>
                <button className="btn btn-danger" onClick={handleRemove} disabled={loading}>حذف</button>
              </div>
            )} */}
            {!cartItem ? (
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={loading || !cart}
              >
                اضف للسلة
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={handleRemove}
                disabled={loading}
              >
                حذف
              </button>
            )}
          </div>

          <h3>الدفع مؤمن بواسطة بوابة الدفع MYFATORA <RiSecurePaymentLine /></h3>
        </div>
      </div>

      {/* Popups */}
      {isPopupOpenDynamic && (
        <div className="popup-overlay-dynamic" onClick={() => setIsPopupOpenDynamic(false)}>
          <div className="popup-content-dynamic" onClick={e => e.stopPropagation()}>
            <header>
              <h3>شهادة الفحص</h3>
              <button onClick={() => setIsPopupOpenDynamic(false)}><FaArrowCircleLeft /></button>
            </header>
            <div className="image">
              <span>تم الفحص <IoCheckmarkDoneCircle /></span>
              <img src={product.image} alt={product.name} />
            </div>

            <div className="popup-overlay-dynamic-items">
              <div className="popup-overlay-dynamic-item">
                <h6>نـوع الجهاز</h6>
                <h6>{product.name}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>حالة الجهاز</h6>
                <h6>{product.device_status == 1 ? "مفتوح" : "جديد"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>نظافة الجهاز</h6>
                <h6>%{product.device_clean}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>خدوش جسم الجهاز</h6>
                <h6>{product.device_body == 1 ? "لا يوجد" : "يوجد"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>الشاشة زجاج خدوش</h6>
                <h6>{product.device_display ?? "-"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>السنسرات الواي فاي</h6>
                <h6>{product.device_wifi_blu ?? "-"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>وظائف حساسات</h6>
                <h6>{product.device_camera ?? "-"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>زر التشغيل - رفع خفض</h6>
                <h6>{product.device_button ?? "-"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>البطارية ونسبة</h6>
                <h6>{product.device_battery ?? "-"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>السماعة الخارجية</h6>
                <h6>{product.device_speaker ?? "-"}</h6>
              </div>
              <div className="popup-overlay-dynamic-item">
                <h6>البصمات : بصمة الوجه</h6>
                <h6>{product.device_fingerprint ?? "-"}</h6>
              </div>
            </div>
          </div>

        </div>
      )}

      {isPopupOpenFixed && (
        <div className="popup-overlay-fixed" onClick={() => setIsPopupOpenFixed(false)}>
          <div className="popup-content-fixed" onClick={e => e.stopPropagation()}>
            <header><h2>ضمان تجربة وإرجاع</h2></header>
            <h4>كيفية عمل الفترة التجريبية المجانية الخاصة بكم؟</h4>
            <div className="items-descrption">
              <div className="item-descrption"><FaCalendarAlt className="icon" /><div><h6>يوم الشراء</h6><p>ستحصل على الجهاز التجريبي لمدة 3 أيام وسيتم خصم المبلغ من حسابك في محفظتك.</p></div></div>
              <div className="item-descrption"><FaStar className="icon" /><div><h6>يوم 3</h6><p>انتهاء الفترة التجريبية وإيداع المبلغ أو استرداده بالكامل.</p></div></div>
              <div className="item-descrption"><FaCog className="icon" /><div><h6>يوم 4</h6><p>تبدأ الكفالة الممتدة 3 أشهر عند الشراء.</p></div></div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setIsPopupOpenFixed(false)}>إغلاق <FaWindowClose /></button>
          </div>
        </div>
      )}


      <div className="shipping-detials">
        <div className="item">
          <MdLocalShipping />
          <h4>شحن سريع</h4>
        </div>
        <div className="item">
          <IoMdClock />
          <h4>دعم فني متواصل</h4>
        </div>
        <div className="item">
          <SiMoneygram />
          <h4>ضمان الاسترجاع</h4>
        </div>
      </div>

      <div className="account-social-media">
        <h6>حساباتنا على السوشيال ميديا</h6>
        <Link to="">
          <AiFillTikTok />
        </Link>
        <Link to="">
          <FaSquareInstagram />
        </Link>
      </div>
    </div>
  );
};

export default ProductDetails;
