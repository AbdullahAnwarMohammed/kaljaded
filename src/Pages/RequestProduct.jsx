import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiGift } from "react-icons/fi";
import { MdQrCodeScanner, MdVisibility } from "react-icons/md";
import { useTranslation } from "react-i18next";
import EmptyStateAnimation from "../components/EmptyStateAnimation/EmptyStateAnimation";
import "./RequestProduct.css";
import popupImage from '../assets/popup.png';
import Api from "../Services/Api";

const RequestProduct = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === "ar";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false); // To prevent multiple fetch calls

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchProducts(searchQuery, 1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        if (page > 1) {
            fetchProducts(searchQuery, page);
        }
    }, [page]);

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop + 100 >=
                document.documentElement.offsetHeight &&
                hasMore && 
                !loading && 
                !isFetching
            ) {
                setPage((prevPage) => prevPage + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading, isFetching]);


    const fetchProducts = async (query = '', pageNum = 1) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setIsFetching(true);
        }

        try {
            let url = query ? `/products-customer?search=${query}&page=${pageNum}` : `/products-customer?page=${pageNum}`;
            const response = await Api.get(url);
            
            if (response.data && response.data.success) {
                const newData = response.data.data.data; // Accessing the data array inside pagination object
                const meta = response.data.data.meta;
                
                if (pageNum === 1) {
                    setProducts(newData);
                } else {
                    setProducts((prev) => [...prev, ...newData]);
                }
                
                // Check if we have more pages
                if (meta && meta.current_page < meta.last_page) {
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleWhatsapp = () => {
        window.open("https://wa.me/+96567691171", "_blank"); 
    };

    const [showPopup, setShowPopup] = useState(true);

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="request-product-wrapper">
            {showPopup && (
                <div className="home-popup-overlay">
                    <div className="home-popup-image-container">
                         <img 
                            src={popupImage} 
                            alt="Welcome Popup" 
                            className="home-popup-image"
                        />
                         <div className="home-popup-gradient"></div>
                    </div>

                    <button 
                        onClick={closePopup}
                        className="home-popup-close-btn"
                    >
                        &times;
                    </button>

                    <div className="home-popup-content">
                        <h2 className="home-popup-title">
                            اعرض جهازك للمزايدة <br /> واحصل على أعلى سعر
                        </h2>
                        <p className="home-popup-text">
                            سيتم عرض جهازك على التجار في منطقتك <br /> ليتنافسوا في تقديم أفضل سعر لك
                        </p>
                        <button 
                            className="home-popup-action-btn"
                            onClick={closePopup}
                        >
                            ابدأ المزايدة الآن
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="request-product-header">
                <div className="header-icon-container" onClick={() => setShowSearch(!showSearch)}>
                    <FiSearch size={24} />
                </div>
                
                {showSearch ? (
                    <input 
                        type="text" 
                        className="header-search-input"
                        placeholder={t("search") || "بحث..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                ) : (
                    <h5>{t("products") || "المنتجات"}</h5>
                )}
                
                 <div className="header-icon-container">
                    {/* Placeholder for symmetry or other icon if needed */}
                </div>
            </div>

            {/* Content */}
            <div className="request-product-content">
                {showSearch && searchQuery && !loading && (
                    <div className="search-summary-bar">
                         <span className="search-summary-text">
                            {t("found") || "وجدنا"} 
                            <strong> {products.length} </strong>
                            {t("results_for") || "نتائج بحث عن"} 
                            <strong> "{searchQuery}" </strong>
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-spinner-container">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="products-grid">
                            {products.map((product) => (
                                <div 
                                    key={product.id} 
                                    className={`product-card product-card-details ${product.is_sold ? 'product-sold-style' : ''}`}
                                    onClick={() => navigate(`/product-customer/${product.id}`)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <div className="product-image-wrapper">
                                        {product.images ? (
                                            <img 
                                                src={`http://127.0.0.1:8000/${product.images.split(',')[0]}`} 
                                                alt={product.name} 
                                                className="product-image"
                                            />
                                        ) : (
                                            <div className="no-image-placeholder">
                                                <MdQrCodeScanner size={32} />
                                            </div>
                                        )}
                                        <div className="product-badges-wrapper">
                                            <div className={`product-status-badge ${product.product_active_new === 1 ? 'new' : 'used'}`}>
                                                {product.product_active_new === 1 ? (t('new') || 'جديد') : (t('used') || 'مستعمل')}
                                            </div>
                                            <div className="product-time-badge">
                                                {product.time_ago}
                                            </div>
                                        </div>
                                        
                                        {product.gift && (
                                            <div className="product-gift-badge">
                                                <FiGift size={12} />
                                            </div>
                                        )}

                                        <div className="product-views-wrapper">
                                            <div className="product-views-badge">
                                                <MdVisibility size={14} />
                                                <span>{product.view || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="product-details">
                                        <div className="product-row header-row">
                                            <h6 className="product-name">{product.name}</h6>
                                            {product.category && (
                                                <div className="product-category-badge">
                                                    {product.category.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-row footer-row">
                                            <div className="product-offers-count">
                                                <span className="offers-value">{product.offers_count || 0}</span>
                                                <span className="offers-label"> {t('offers') || 'عروض'} </span>
                                            </div>
                                            <p className="product-date">
                                                {new Date(product.created_at).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>

                                        {/* Battery Condition Bar */}
                                        {product.product_active_new === 0 && product.details && (
                                             <div className="product-condition-bar-container">
                                                <div 
                                                    className="product-condition-bar-fill" 
                                                    style={{ width: `${product.details.device_battery || 100}%` }}
                                                ></div>
                                                <span className="condition-percentage">
                                                    {product.details.device_battery ? `${product.details.device_battery}%` : ''}
                                                </span>
                                                <span className="condition-text">
                                                    {product.details.device_condition || (t('used') || 'مستعمل')}
                                                </span>
                                             </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isFetching && (
                            <div className="loading-spinner-container" style={{ padding: '20px' }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state-container">
                        <EmptyStateAnimation />
                        <h5 className="empty-state-text">{t("no_products") || "لا توجد منتجات"}</h5>
                    </div>
                )}

                <div className="action-button-container">
                    <button
                        onClick={() => navigate('/add-device')}
                        className="btn action-button"
                    >
                        <span>{t("add_product") || "اضافة منتج"}</span>
                        <MdQrCodeScanner size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestProduct;
