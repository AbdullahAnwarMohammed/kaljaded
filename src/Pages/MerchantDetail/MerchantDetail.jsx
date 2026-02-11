import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "./MerchantDetail.css";
import imagePlaceholder from "../../assets/merchmant.jpg";
import ProductCard from "../../components/CategorySection/ProductCard";
import Api from "../../Services/Api";
import { RiArrowRightLine, RiSearchLine, RiShoppingCart2Line } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { TbMoodEmpty } from "react-icons/tb";
import { LoadingContext } from "../../context/LoadingContext";
import { useTranslation } from "react-i18next";

// دالة لرسم النجوم ديناميكياً
const renderStars = (rating) => {
    const stars = [];
    let x = rating || 0;
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
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const { loading: globalLoading } = useContext(LoadingContext);

    // بيانات التاجر - نحاول جلبها من الـ state للقادم من صفحة المتاجر ليكون التحميل لحظياً
    const [merchant, setMerchant] = useState(location.state?.merchant || null);
    const [loadingMerchant, setLoadingMerchant] = useState(!merchant);
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
            // لا نظهر اللودر إذا كانت البيانات موجودة مسبقاً
            if (!merchant) setLoadingMerchant(true);
            
            try {
                const res = await Api.get(`/merchants/${id}`, { cache: true });
                if (res.data.success) {
                    setMerchant(res.data.data);
                }
                
                // Fetch Sales Count
                const salesRes = await Api.get(`/merchants/${id}/sales`, { cache: true });
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
            setLoadingProducts(products.length === 0);
            try {
                const params = { per_page: 12, page, q: debouncedSearch };
                const res = await Api.get(`/merchants/${id}/products`, { 
                    params,
                    cache: true
                });

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
        if (pageToFetch === 1) setLoadingReviews(reviews.length === 0);
        else setIsFetchingMoreReviews(true);

        try {
            const res = await Api.get(`/merchants/${id}/reviews`, { 
                params: { page: pageToFetch },
                cache: true
            });
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
                const res = await Api.get(`/merchants/${id}/review-eligibility`, {
                    cache: true,
                    skipLoader: true
                });
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
            alert(t('merchant_detail.error_sending_review') + " " + (err.response?.data?.message || ""));
        } finally {
            setSubmittingReview(false);
        }
    };


    if (loadingMerchant && !merchant) return null; 
    
    if (!merchant) {
        return (
            <div className="merchant-details-page">
                 <div className="top-header">
                    <Link to="/merchants" className="icon-back">
                        <RiArrowRightLine />
                    </Link>
                    <h6 style={{ marginBottom: "10px" }}>{t('merchant_detail.not_found_header')}</h6>
                </div>
                <div style={{ textAlign: "center", padding: "100px 20px" }}>
                    <TbMoodEmpty style={{ fontSize: "5rem", color: "#ddd", marginBottom: "20px" }} />
                    <h3 style={{ color: "#2c3e50" }}>{t('merchant_detail.not_found_message')}</h3>
                    <Link to="/merchants" style={{ color: "#435293", textDecoration: "underline", marginTop: "10px", display: "inline-block" }}>{t('merchant_detail.back_to_merchants')}</Link>
                </div>
            </div>
        );
    }

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

                        <a href={`tel:96567691171`} className="phone-icon">
                            <FaPhoneAlt />
                        </a>

                        <a 
                            href={`https://wa.me/96567691171`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="whatsapp-icon"
                        >
                            <FaWhatsapp />
                        </a>
                    </div>

                    <div className="right">
                        <div className="icon">
                            {merchant.average_rating > 0 && <small>{merchant.average_rating}</small>}
                            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                                {renderStars(merchant.average_rating ?? 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Tabs Switcher & Content ===== */}
            {!globalLoading && (
                <>
                    <div className="tabs-container">
                        <div className="tabs-switcher">
                            <button 
                                className={activeTab === "products" ? "active" : ""} 
                                onClick={() => setActiveTab("products")}
                            >
                                {t('products')}
                            </button>
                            <button 
                                className={activeTab === "reviews" ? "active" : ""} 
                                onClick={() => setActiveTab("reviews")}
                            >
                                {t('merchant_detail.customer_reviews')}
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
                                    placeholder={t('merchant_detail.search_placeholder')}
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
                                    <div className="products-grid">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="product-skeleton">
                                                <div className="skeleton-loader" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '10px' }}></div>
                                                <div className="skeleton-loader" style={{ width: '80%', height: '14px', marginTop: '10px', borderRadius: '4px' }}></div>
                                                <div className="skeleton-loader" style={{ width: '50%', height: '12px', marginTop: '5px', borderRadius: '4px' }}></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : products.length > 0 ? (
                                    <div className="products-grid">
                                        {products.map((product) => <ProductCard key={product.id} p={product} showFastBadge={true} />)}
                                    </div>
                                ) : (

                                    <p className="empty-products">{t('merchant_detail.no_products')}  <TbMoodEmpty /></p>
                                )}
                            </div>
                        ) : (
                            /* === Reviews View === */
                            <div className="reviews-section">
                                {/* Summary Cards */}
                                <div className="reviews-summary">
                                    <div className="review-summary-card">
                                        {Number(merchant.average_rating) > 0 && <h3>{merchant.average_rating}</h3>}
                                        <div className="stars">
                                            {renderStars(merchant.average_rating ?? 0)}
                                        </div>
                                        <span className="sub-text">
                                            {merchant.reviews_count > 0 
                                                ? `(${merchant.reviews_count} ${t('merchant_detail.reviews_count_suffix')})`
                                                : `(${t('no_ratings') || 'لا يوجد تقييمات'})`
                                            }
                                        </span>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-bar-fill" 
                                                style={{ width: `${(merchant.average_rating / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="review-summary-card">
                                        <h3 style={{ fontSize: '2.5rem', marginBottom: '0', color: '#2d2e83' }}>{salesCount > 0 ? salesCount : "0"}</h3>
                                        <div style={{ fontSize: '1.8rem', color: '#2d2e83', margin: '5px 0' }}><RiShoppingCart2Line /></div>
                                        <span className="sub-text">{t('merchant_detail.sales_count')}</span>
                                    </div>
                                </div>

                                <div className="section-divider">{t('merchant_detail.customer_reviews')}</div>

                                {reviewEligibility.allowed ? (
                                    <div className="add-review-box" style={{ background: "#fff", padding: "20px", borderRadius: "15px", marginBottom: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
                                        <h5 style={{ margin: "0 0 10px 0" }}>{t('merchant_detail.add_review')}</h5>
                                        <div style={{ marginBottom: "10px" }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} onClick={() => setNewReview({ ...newReview, rating: star })} style={{ cursor: "pointer", fontSize: "1.5rem", color: star <= newReview.rating ? "#ffc107" : "#ddd" }}>
                                                    <FaStar />
                                                </span>
                                            ))}
                                        </div>
                                        <textarea className="form-control" rows="3" placeholder={t('merchant_detail.write_comment_placeholder')} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "10px", outline: "none" }}></textarea>
                                        <button className="btn-submit-review" onClick={handleSubmitReview} disabled={submittingReview} style={{ background: "#2c3e50", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "25px", cursor: "pointer", fontWeight: "bold" }}>
                                            {submittingReview ? t('merchant_detail.submitting') : t('merchant_detail.submit_review')}
                                        </button>
                                    </div>
                                ) : reviewEligibility.message === "wait_for_cooldown" && (
                                    <div className="add-review-box" style={{ background: "#fff3cd", color: "#856404", padding: "20px", borderRadius: "15px", marginBottom: "20px", border: "1px solid #ffeeba", textAlign: "center" }}>
                                        <h5 style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>{t('merchant_detail.wait_to_rate')}</h5>
                                        <p style={{ fontSize: "1.2rem", direction: "ltr" }}>{formatTime(countdown)}</p>
                                        <small>{t('merchant_detail.wait_desc')}</small>
                                    </div>
                                )}

                                <div className="reviews-list">
                                    {loadingReviews ? (
                                        <p style={{ gridColumn: "1/-1", textAlign: "center" }}>{t('merchant_detail.loading_reviews')}</p>
                                    ) : reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div className="review-card" key={review.id}>
                                                <div className="avatar-circle" style={{ background: "#2c3e50" }}>{review.user?.name ? review.user.name.charAt(0) : "U"}</div>
                                                <div className="review-content">
                                                    <div className="review-header">
                                                        <h5>{review.user?.name || t('merchant_detail.user_fallback')}</h5>
                                                        <span className="date">{new Date(review.created_at).toLocaleDateString('ar-EG')}</span>
                                                    </div>
                                                    <div className="rating-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} style={{ color: i < review.rating ? "#ffc107" : "#ddd" }}><FaStar /></span>
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
                                                <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{t('merchant_detail.buy_first')}</p>
                                            </div>
                                        ) : (
                                            <div className="empty-reviews-state">
                                                <TbMoodEmpty />
                                                <p>{t('merchant_detail.no_reviews_yet')}</p>
                                            </div>
                                        )
                                    )}
                                    {reviews.length > 0 && hasMoreReviews && (
                                        <div ref={lastReviewElementRef} style={{ gridColumn: "1/-1", height: "20px", margin: "10px 0" }}>
                                            {isFetchingMoreReviews && <p style={{ textAlign: "center" }}>{t('merchant_detail.loading_more')}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MerchantDetail;
