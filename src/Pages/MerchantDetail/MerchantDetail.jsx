import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import "./MerchantDetail.css";
import imagePlaceholder from "../../assets/merchmant.jpg";
import ProductCard from "../../components/CategorySection/ProductCard";
import Api from "../../Services/Api";
import { RiArrowRightLine, RiSearchLine, RiShoppingCart2Line } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { TbMoodEmpty } from "react-icons/tb";

// دالة بسيطة للـ debounce
// دالة لرسم النجوم ديناميكياً
const renderStars = (rating) => {
    const stars = [];
    let x = 5;
    const fullStars = Math.floor(x);
    const hasHalfStar = x % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<FaStar key={i} style={{ color: "#ffc107" }} />);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<FaStarHalfAlt key={i} style={{ color: "#ffc107" }} />);
        } else {
            stars.push(<FaStar key={i} style={{ color: "#ddd" }} />);
        }
    }
    return stars;
};

// دالة بسيطة للـ debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const MerchantDetail = () => {
    const { id } = useParams();
    // بيانات التاجر
    const [merchant, setMerchant] = useState(null);
    const [loadingMerchant, setLoadingMerchant] = useState(true);
    const [salesCount, setSalesCount] = useState(0);
    const [activeTab, setActiveTab] = useState("products"); // "products" or "reviews"
    
    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [isFetchingMoreReviews, setIsFetchingMoreReviews] = useState(false);

    const [reviewEligibility, setReviewEligibility] = useState({ allowed: false, message: "" });
    const [countdown, setCountdown] = useState(0); 
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    // بيانات المنتجات
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 500); // تأخير 500ms قبل البحث

    useEffect(() => {
        const fetchMerchant = async () => {
            setLoadingMerchant(true);
            try {
                const res = await Api.get(`/merchants/${id}`);
                if (res.data.success) {
                    setMerchant(res.data.data);
                }
                
                // Fetch Sales Count
                const salesRes = await Api.get(`/merchants/${id}/sales`);
                if (salesRes.data.success) {
                    setSalesCount(salesRes.data.data.count);
                }

            } catch (err) {
                console.error("Error fetching merchant:", err.response?.data || err.message);
            } finally {
                setLoadingMerchant(false);
            }
        };
        fetchMerchant();
    }, [id]);

    // جلب المنتجات عند تغير الصفحة أو البحث
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const params = { per_page: 12, page, q: debouncedSearch };
                const res = await Api.get(`/merchants/${id}/products`, { params });

                if (res.data.success) {
                    setProducts(res.data.data.data);
                    setMeta(res.data.data.meta);
                } else {
                    setProducts([]);
                    setMeta({});
                }
            } catch (err) {
                console.error("Error fetching products:", err.response?.data || err.message);
                setProducts([]);
                setMeta({});
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, [id, page, debouncedSearch]);



    // Fetch Reviews Function
    const fetchReviews = async (pageToFetch = 1) => {
        if (pageToFetch === 1) setLoadingReviews(true);
        else setIsFetchingMoreReviews(true);

        try {
            const res = await Api.get(`/merchants/${id}/reviews`, { params: { page: pageToFetch } });
            if (res.data.success) {
                const newReviews = res.data.data.data;
                const meta = res.data.data; // Pagination meta

                if (pageToFetch === 1) {
                    setReviews(newReviews);
                } else {
                    setReviews((prev) => [...prev, ...newReviews]);
                }

                setHasMoreReviews(meta.current_page < meta.last_page);
                setReviewsPage(pageToFetch);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoadingReviews(false);
            setIsFetchingMoreReviews(false);
        }
    };

    // Initial Fetch when tab becomes active
    useEffect(() => {
        if (activeTab === "reviews" && reviews.length === 0) {
            fetchReviews(1);
        }
    }, [id, activeTab]);

    // Intersection Observer for Infinite Scroll
    const observer = useRef();
    const lastReviewElementRef = useCallback(node => {
        if (loadingReviews || isFetchingMoreReviews) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreReviews) {
                fetchReviews(reviewsPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loadingReviews, isFetchingMoreReviews, hasMoreReviews, reviewsPage]);

    // Check Eligibility
    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const res = await Api.get(`/merchants/${id}/review-eligibility`);
                if (res.data.success) {
                    setReviewEligibility(res.data.data);
                    if (res.data.data.message === "wait_for_cooldown" && res.data.data.remaining_seconds) {
                        setCountdown(res.data.data.remaining_seconds);
                    }
                }
            } catch (err) {
                console.error("Error checking eligibility:", err);
            }
        };
        // Fetch only if user is logged in (you might need a check here, but API handles auth)
        checkEligibility();
    }, [id]);

    // Countdown Timer logic
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);
    
    // Format Seconds to MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmitReview = async () => {
        setSubmittingReview(true);
        try {
            const res = await Api.post(`/merchants/${id}/reviews`, newReview);
            if (res.data.success) {
                // Refresh reviews and eligibility
                setReviewEligibility({ allowed: false, message: "already_reviewed" });
                setNewReview({ rating: 5, comment: "" });
                // Re-fetch reviews
                const reviewsRes = await Api.get(`/merchants/${id}/reviews`);
                if (reviewsRes.data.success) {
                    setReviews(reviewsRes.data.data.data);
                }
            }
        } catch (err) {
            console.error("Error submitting review:", err.response?.data || err.message);
            alert("حدث خطأ أثناء إرسال التقييم: " + (err.response?.data?.message || ""));
        } finally {
            setSubmittingReview(false);
        }
    };


    if (loadingMerchant) return <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>جاري تحميل بيانات التاجر...</div>;
    if (!merchant) return <p style={{ textAlign: "center", padding: "50px" }}>التاجر غير موجود</p>;

    return (
        <div className="merchant-details-page">
            <div className="top-header">
                <Link to="/merchants" className="icon-back">
                    <RiArrowRightLine />
                </Link>
                <h6>{merchant.name_vendor || merchant.name}</h6>
            </div>
            {/* ===== Header ===== */}
            <header className="merchant-header">
                <div className="merchant-image">
                    <img src={merchant.image_vendor || imagePlaceholder} alt={merchant.name} />
                </div>

                <div className="info">
                    <div className="left">

                        <a href={`tel:${merchant.phone_vendor || merchant.phone}`} className="phone-icon">
                            <FaPhoneAlt />
                        </a>

                        <a 
                            href={`https://wa.me/${merchant.phone_vendor || merchant.phone}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="whatsapp-icon"
                        >
                            <FaWhatsapp />
                        </a>
                    </div>

                    <div className="right">
                        <div className="icon">
                            {/* <small>{merchant.average_rating ?? "0.0"}</small> */}
                            <small>{5 ?? "0.0"}</small>
                            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                                {renderStars(merchant.average_rating ?? 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Tabs Switcher ===== */}
            <div className="tabs-container">
                <div className="tabs-switcher">
                    <button 
                        className={activeTab === "products" ? "active" : ""} 
                        onClick={() => setActiveTab("products")}
                    >
                        المنتجات
                    </button>
                    <button 
                        className={activeTab === "reviews" ? "active" : ""} 
                        onClick={() => setActiveTab("reviews")}
                    >
                        التقيمات
                    </button>
                </div>
            </div>

            {/* ===== Search (Only for Products) ===== */}
            {activeTab === "products" && (
                <div className="search-container" style={{ padding: "0 13px", marginTop: "15px" }}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث في منتجات التاجر..."
                            style={{
                                width: "100%",
                                padding: "12px 15px",
                                paddingRight: "40px", 
                                borderRadius: "10px",
                                border: "1px solid #ddd",
                                outline: "none",
                                fontSize: "0.95rem"
                            }}
                        />
                        <RiSearchLine style={{
                            position: "absolute",
                            right: "12px",
                            color: "#888",
                            fontSize: "1.2rem"
                        }} />
                    </div>
                </div>
            )}




            {/* ===== Content Section ===== */}
            <div className="merchant-products-section">
                
                {activeTab === "products" ? (
                    /* === Products View === */
                    <div className="products-row">
                        {loadingProducts ? (
                            <p>جاري تحميل المنتجات...</p>
                        ) : products.length > 0 ? (
                            <div className="products-grid">
                                {products.map((product) => <ProductCard key={product.id} p={product} showFastBadge={true} />)}
                            </div>
                        ) : (
                            <p className="empty-products">لا توجد منتجات لهذا التاجر  <TbMoodEmpty /></p>
                        )}
                    </div>
                ) : (
                    /* === Reviews View === */
                    <div className="reviews-section">
                        
                        {/* Summary Cards */}
                        <div className="reviews-summary">
                            {/* Rating Card */}
                            <div className="review-summary-card">
                                <h3>{merchant.average_rating ?? "0.0"}</h3>
                                <div className="stars">
                                    {renderStars(merchant.average_rating ?? 0)}
                                </div>
                                <span className="sub-text">({merchant.reviews_count ?? 0} تقييم)</span>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-bar-fill" 
                                        style={{ width: `${(merchant.average_rating / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Sales Card */}
                            <div className="review-summary-card">
                                <div className="icon-sales"><RiShoppingCart2Line /></div>
                                <h3>{salesCount > 0 ? salesCount : "0"}</h3>
                                <span className="sub-text">عدد المبيعات</span>
                            </div>
                        </div>


                        {/* Divider */}
                        <div className="section-divider">تعليقات العملاء</div>

                        {/* Add Review Form (Conditional) */}
                        {reviewEligibility.allowed ? (
                            <div className="add-review-box" style={{ 
                                background: "#fff", padding: "20px", borderRadius: "15px", marginBottom: "20px",
                                boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
                            }}>
                                <h5 style={{ margin: "0 0 10px 0" }}>أضف تقييمك</h5>
                                <div style={{ marginBottom: "10px" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span 
                                            key={star} 
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            style={{ 
                                                cursor: "pointer", 
                                                fontSize: "1.5rem", 
                                                color: star <= newReview.rating ? "#ffc107" : "#ddd" 
                                            }}
                                        >
                                            <FaStar />
                                        </span>
                                    ))}
                                </div>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="اكتب تعليقك هنا..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    style={{ 
                                        width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd", 
                                        marginBottom: "10px", outline: "none"
                                    }}
                                ></textarea>
                                <button 
                                    className="btn-submit-review"
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                    style={{
                                        background: "#2c3e50", color: "#fff", border: "none", padding: "10px 20px",
                                        borderRadius: "25px", cursor: "pointer", fontWeight: "bold"
                                    }}
                                >
                                    {submittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
                                </button>
                            </div>
                        ) : reviewEligibility.message === "wait_for_cooldown" && (
                            <div className="add-review-box" style={{ 
                                background: "#fff3cd", color: "#856404", padding: "20px", borderRadius: "15px", marginBottom: "20px",
                                border: "1px solid #ffeeba", textAlign: "center"
                            }}>
                                <h5 style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>يرجى الانتظار لتقييم البائع</h5>
                                <p style={{ fontSize: "1.2rem", direction: "ltr" }}>{formatTime(countdown)}</p>
                                <small>يمكنك ترك تقييم بعد مرور ساعة من الشراء</small>
                            </div>
                        )}


                        {/* Reviews List */}
                        <div className="reviews-list">
                            {loadingReviews ? (
                                <p style={{ gridColumn: "1/-1", textAlign: "center" }}>جاري تحميل التقيمات...</p>
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div className="review-card" key={review.id}>
                                        <div className="avatar-circle" style={{ background: "#2c3e50" }}>
                                            {review.user?.name ? review.user.name.charAt(0) : "U"}
                                        </div>
                                        <div className="review-content">
                                            <div className="review-header">
                                                <h5>{review.user?.name || "مستخدم"}</h5>
                                                <span className="date">{new Date(review.created_at).toLocaleDateString('ar-EG')}</span>
                                            </div>
                                            <div className="rating-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} style={{ color: i < review.rating ? "#ffc107" : "#ddd" }}>
                                                        <FaStar />
                                                    </span>
                                                ))}
                                            </div>
                                            <p>{review.comment}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !reviewEligibility.allowed && reviewEligibility.message !== "wait_for_cooldown" ? (
                                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#888" }}>
                                        <TbMoodEmpty style={{ fontSize: "3rem", marginBottom: "10px" }} />
                                        <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>قم بشراء المنتج اولاً وقيم البائع</p>
                                    </div>
                                ) : (
                                    <div className="empty-reviews-state">
                                        <TbMoodEmpty />
                                        <p>لا توجد تقييمات بعد، كن أول من يقيم!</p>
                                    </div>
                                )
                            )}
                            
                            {/* Sentinel for Infinite Scroll */}
                            {reviews.length > 0 && hasMoreReviews && (
                                <div ref={lastReviewElementRef} style={{ gridColumn: "1/-1", height: "20px", margin: "10px 0" }}>
                                    {isFetchingMoreReviews && <p style={{ textAlign: "center" }}>جاري تحميل المزيد...</p>}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchantDetail;
