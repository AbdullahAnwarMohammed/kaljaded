import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiGift, FiClock, FiChevronLeft, FiChevronRight, FiZap } from "react-icons/fi";
import { FaGavel, FaWhatsapp } from "react-icons/fa";
import { MdQrCodeScanner, MdVisibility } from "react-icons/md";
import { useTranslation } from "react-i18next";
import EmptyStateAnimation from "../components/EmptyStateAnimation/EmptyStateAnimation";
import "./RequestProduct.css";
import popupImage from '../assets/popup.png';
import Api from "../Services/Api";

const CountdownTimer = ({ expiryDate }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const difference = +new Date(expiryDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor(difference / (1000 * 60 * 60)),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryDate]);

    return (
        <div className="auction-timer">
            <FiClock size={12} />
            <span>
                {timeLeft.hours.toString().padStart(2, '0')}:
                {timeLeft.minutes.toString().padStart(2, '0')}:
                {timeLeft.seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};

const RequestProduct = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === "ar";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCount, setActiveCount] = useState(0);

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false); // To prevent multiple fetch calls

    const [showSelection, setShowSelection] = useState(false);
    const [selectedType, setSelectedType] = useState('auction');

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


    const handleToggleAuction = async (e, product) => {
        e.stopPropagation();
        try {
            const response = await Api.post(`/products-customer/${product.id}/toggle-auction`);
            if (response.data.success) {
                setProducts(prev => prev.map(p => 
                    p.id === product.id ? { ...p, auction_status: !p.auction_status } : p
                ));
            }
        } catch (error) {
            console.error("Error toggling auction status:", error);
        }
    };

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
                
                if (response.data.data.active_count !== undefined) {
                    setActiveCount(response.data.data.active_count);
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
            
            // Check if we need to load more because the screen isn't full
            setTimeout(() => {
                if (
                    document.documentElement.scrollHeight <= window.innerHeight + 100 && 
                    hasMore && 
                    !loading && 
                    !isFetching
                ) {
                    setPage(prev => prev + 1);
                }
            }, 500);
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

    const startFlow = () => {
        setShowPopup(false);
        setShowSelection(true);
    };

    const handleNext = () => {
        if (selectedType === 'auction') {
            navigate('/add-device');
        } else {
            handleWhatsapp();
        }
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
                        <div className="popup-selection-container">
                            <div 
                                className={`popup-option-card ${selectedType === 'auction' ? 'selected' : ''}`}
                                onClick={() => setSelectedType('auction')}
                            >
                                <FaGavel size={20} className="option-card-icon" />
                                <span>ابدأ المزايدة</span>
                            </div>
                            <div 
                                className={`popup-option-card ${selectedType === 'selling' ? 'selected' : ''}`}
                                onClick={() => setSelectedType('selling')}
                            >
                                <FaWhatsapp size={20} className="option-card-icon" />
                                <span>بيعه سريعة</span>
                            </div>
                        </div>

                        <button 
                            className="home-popup-action-btn next-variant"
                            onClick={handleNext}
                        >
                            <span className="next-btn-text">التالي</span>
                            {/* {isRTL ? <FiChevronLeft size={20} className="next-btn-icon" /> : <FiChevronRight size={20} className="next-btn-icon" />} */}
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
                    <h5 className="auctions-title">
                        {t("auctions") || "المزايدة"}
                        {activeCount > 0 && <span className="active-count-badge">{activeCount}</span>}
                    </h5>
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
                        <div className="products-list">
                            {products.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="product-card-horizontal"
                                    onClick={() => navigate(`/product-customer/${product.id}`)}
                                    style={{cursor: 'pointer'}}
                                >
                                     {/* Left Side: Auction Actions */}
                                     <div className="card-auction-actions">
                                         <div className="card-auction-header">
                                            <div className={`auction-badge ${product.auction_status ? 'open' : 'closed'}`}>
                                                {product.auction_status ? t("open_for_auction") || "مفتوح للمزاد" : t("closed_for_auction") || "المزاد متوقف"}
                                            </div>

                                            {product.expires_at && (
                                                <CountdownTimer expiryDate={product.expires_at} />
                                            )}
                                         </div>

                                         <h6 className="horizontal-title">{product.name}</h6>

                                         <button 
                                             className={`btn-auction-toggle ${product.auction_status ? 'stop' : 'start'}`}
                                             onClick={(e) => handleToggleAuction(e, product)}
                                         >
                                             {product.auction_status ? t("stop_auction") || "ايقاف المزاد" : t("start_auction") || "فتح المزاد"}
                                         </button>
                                     </div>

                                     {/* Right Side: Image */}
                                     <div className="horizontal-image-wrapper">
                                         {product.images ? (
                                             <img 
                                                 src={`http://127.0.0.1:8000/${product.images.split(',')[0]}`} 
                                                 alt={product.name} 
                                                 className="horizontal-product-image"
                                             />
                                         ) : (
                                             <div className="no-image-placeholder" style={{height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                  <MdQrCodeScanner size={24} color="#ccc" />
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
