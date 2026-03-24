import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowRight, FaBox, FaWifi, FaBluetooth, FaMapMarkerAlt, FaExpand, FaBatteryFull, FaCamera, FaPowerOff, FaVolumeUp, FaFingerprint, FaClock, FaList, FaInfoCircle, FaTools, FaTimes, FaCheckCircle, FaTimesCircle, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import Api from "../Services/Api";
import Swal from 'sweetalert2';
import "./ProductCustomerDetails.css";

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
        <div className="auction-timer-simple">
            <span>
                {timeLeft.hours.toString().padStart(2, '0')}:
                {timeLeft.minutes.toString().padStart(2, '0')}:
                {timeLeft.seconds.toString().padStart(2, '0')}
            </span>
            <FiClock size={14} />
        </div>
    );
};

const ProductCustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'specs'
    
    // Pagination for offers
    const [offers, setOffers] = useState([]);
    const [offersPage, setOffersPage] = useState(1);
    const [hasMoreOffers, setHasMoreOffers] = useState(true);
    const [isFetchingOffers, setIsFetchingOffers] = useState(false);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await Api.get(`/products-customer/${id}`);
            if (response.data && response.data.success) {
                const p = response.data.data;

                // Authorization Check: Compare logged in user ID with product owner ID
                const customerData = localStorage.getItem("customer");
                const currentUser = customerData ? JSON.parse(customerData) : null;

                if (!currentUser || p.user_id !== currentUser.id) {
                    console.warn("Unauthorized access attempt to product details.");
                    navigate("/request-product");
                    return;
                }

                setProduct(p);
                if (p.images && p.images.length > 0) {
                     const imgs = p.images.split(',');
                     setSelectedImage(imgs[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                navigate("/request-product");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async (pageNum = 1) => {
        if (isFetchingOffers || (!hasMoreOffers && pageNum > 1)) return;
        
        try {
            setIsFetchingOffers(true);
            const response = await Api.get(`/products-customer/${id}/offers?page=${pageNum}`);
            if (response.data && response.data.success) {
                const newData = response.data.data.data;
                const meta = response.data.data.meta;
                
                if (pageNum === 1) {
                    setOffers(newData);
                } else {
                    setOffers(prev => [...prev, ...newData]);
                }
                
                setHasMoreOffers(meta.current_page < meta.last_page);
            }
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setIsFetchingOffers(false);
        }
    };

    useEffect(() => {
        fetchProductDetails();
        fetchOffers(1);
    }, [id]);

    // Scroll listener for infinite offers
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop + 100 >= 
                document.documentElement.offsetHeight &&
                hasMoreOffers && 
                !isFetchingOffers
            ) {
                setOffersPage(prev => prev + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMoreOffers, isFetchingOffers]);

    useEffect(() => {
        if (offersPage > 1) {
            fetchOffers(offersPage);
        }
    }, [offersPage]);

    const handleToggleAuction = async (e) => {
        e.stopPropagation();
        try {
            const response = await Api.post(`/products-customer/${product.id}/toggle-auction`);
            if (response.data.success) {
                setProduct(prev => ({ ...prev, auction_status: !prev.auction_status }));
            }
        } catch (error) {
            console.error("Error toggling auction status:", error);
        }
    };

    useEffect(() => {
        // fetchProductDetails(); // Moved to separate useeffects above
    }, [id]);

    if (loading) return <div className="loading-spinner">{t('loading') || 'Loading...'}</div>;
    if (!product) return <div className="error-message">{t('product_not_found') || 'Product not found'}</div>;

    const imagesList = product.images ? product.images.split(',') : [];
    const details = product.details;
    
    // getCategorySpecKeys helper
    const getCategorySpecKeys = () => {
        const catName = product.category?.name?.toLowerCase() || '';
        const catSlug = product.category?.slug?.toLowerCase() || '';
        const is = (key) => catName.includes(key) || catSlug.includes(key);

        const common = ['box', 'usage', 'opened', 'cleanliness'];

        // 1. Watches
        if (is('watch') || is('ساعة') || is('ساعات')) {
            return [...common, 'battery', 'buttons', 'sensors'];
        }

        // 2. Accessories
        if (is('accessory') || is('accessories') || is('access') || is('اكسسوار')) {
            return ['box', 'usage', 'cleanliness'];
        }

        // 3. Games
        if (is('game') || is('ألعاب') || is('العاب')) {
            return ['box', 'condition'];
        }

        // 4. Default (Phones/Tablets)
        return [
            ...common,
            'battery', 'wifi', 'bluetooth', 'gps', 'sensors',
            'camera', 'buttons', 'speaker', 'fingerprint'
        ];
    };

    const allowedSpecs = getCategorySpecKeys();
    const hasAcceptedOffer = product?.offers?.some(o => o.status === 1);

    const handleOfferAction = (offerId, newStatus) => {
        const isAccept = newStatus === 1;
        const isUndo = newStatus === 0;
        
        let title = isAccept ? (t('confirm_accept_offer') || 'قبول العرض؟') : (t('confirm_reject_offer') || 'رفض العرض؟');
        if (isUndo) title = t('confirm_undo_offer') || 'تراجع عن القرار؟';

        Swal.fire({
            title: title || (isAccept ? 'قبول العرض؟' : 'تراجع؟'),
            text: isUndo ? (t('confirm_undo_text') || 'هل تريد العودة للحالة السابقة؟') : (t('confirm_accept_text') || 'هل أنت متأكد من قبول هذا العرض؟'),
            icon: isAccept ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: isUndo ? (t('yes_undo') || 'نعم، تراجع') : (isAccept ? (t('yes_accept') || 'نعم، قبول') : (t('yes_reject') || 'نعم، رفض')),
            cancelButtonText: t('cancel') || 'إلغاء',
            reverseButtons: true,
            customClass: {
                popup: 'premium-swal-popup',
                title: 'premium-swal-title',
                htmlContainer: 'premium-swal-html',
                confirmButton: 'premium-swal-confirm',
                cancelButton: 'premium-swal-cancel',
                icon: 'premium-swal-icon'
            },
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__fadeInUp animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutDown animate__faster'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Api.put(`/products-customer-offers/${offerId}/status`, { status: newStatus })
                    .then(async response => {
                        if (response.data && response.data.success) {
                            // If accepting and auction is currently open, stop it mandatorily
                            if (isAccept && product.auction_status) {
                                try {
                                    await Api.post(`/products-customer/${product.id}/toggle-auction`);
                                } catch (e) {
                                    console.error("Error auto-stopping auction:", e);
                                }
                            }

                            Swal.fire({
                                title: t('success') || 'تم بنجاح',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                customClass: {
                                    popup: 'premium-swal-popup',
                                    title: 'premium-swal-title',
                                    icon: 'premium-swal-icon'
                                }
                            });
                            fetchProductDetails();
                        }
                    })
                    .catch(error => {
                        console.error("Error updating offer status:", error);
                        Swal.fire({
                            title: 'Error',
                            text: t('error_updating') || 'حدث خطأ',
                            icon: 'error'
                        });
                    });
            }
        });
    };

    const renderDetail = (icon, label, value) => (
        <div className="detail-card">
            <span className="detail-icon-wrapper">{icon}</span>
            <div className="detail-content">
                <span className="detail-label">{label} :</span>
                <span className="detail-value">{value}</span>
            </div>
        </div>
    );

    return (
        <div className="product-details-page-wrapper">
             {/* Header */}
             <div className="details-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FaArrowRight size={20} />
                </button>
                <h5>{t("product_details") || "تفاصيل المنتج"}</h5>
                <div style={{width: 20}}></div>
            </div>

            <div className="details-content-container">
                
                {/* A. Auction Focused Header Card */}
                <div className="auction-header-card">
                     <div className="card-auction-main">
                        <div className="card-auction-header-row">
                            {product.expires_at && (
                                <CountdownTimer expiryDate={product.expires_at} />
                            )}
                            <div className={`detail-auction-badge ${product.auction_status ? 'open' : 'closed'}`}>
                                {product.auction_status ? t("open_for_auction") || "مفتوح للمزاد" : t("closed_for_auction") || "المزاد متوقف"}
                            </div>
                        </div>

                        <h2 className="detail-auction-title">{product.name}</h2>

                        <button 
                            className={`btn-detail-auction-toggle ${product.auction_status ? 'stop' : 'start'} ${hasAcceptedOffer ? 'disabled-toggle' : ''}`}
                            onClick={handleToggleAuction}
                            disabled={hasAcceptedOffer}
                        >
                            {product.auction_status ? t("stop_auction") || "ايقاف المزاد" : t("start_auction") || "فتح المزاد"}
                        </button>
                     </div>

                     <div className="detail-auction-image-wrapper">
                        {imagesList.length > 0 ? (
                            <img 
                                src={`http://127.0.0.1:8000/${imagesList[0]}`} 
                                alt={product.name} 
                            />
                        ) : (
                            <div className="no-img-placeholder"><FaBox size={30} /></div>
                        )}
                     </div>
                </div>

                {/* B. Offers Section (Moved Up) */}
                <div className="section-block offers-block highlighted-section">
                    <div className="offers-header-row main-offers-header">
                        <h3 className="section-title">
                            <FaList />
                            <span>{t("merchant_offers")}</span> 
                            {product.offers && <span className="offers-count-badge">{product.offers.length}</span>}
                        </h3>
                    </div>
                    
                    {/* Calculate Max Price */}
                    {(() => {
                        const maxPrice = (product.offers && product.offers.length > 0) 
                            ? Math.max(...product.offers.map(o => parseFloat(o.price) || 0)) 
                            : 0;
                        
                        return offers.length > 0 ? (
                            <div className="offers-list">
                                {offers.map((offer) => (
                                    <div key={offer.id} className={`offer-item-card premium-offer-card ${offer.status === 1 ? 'accepted-offer-card' : ''}`}>
                                        {parseFloat(offer.price) === maxPrice && maxPrice > 0 && (
                                            <div className="accept-best-badge">{t('best_offer') || 'أعلى سعر'}</div>
                                        )}
                                    
                                    <div className="offer-card-main-body">
                                        {/* Left Side: Info & Actions */}
                                        <div className="offer-content-left">
                                            <h4 className="offer-merchant-name">{offer.merchant?.name || 'Merchant'}</h4>
                                            
                                            <div className="offer-rating-row">
                                                <span className="rating-num">4.8</span>
                                                <div className="stars-mini">
                                                    <FaStar />
                                                    <FaStar />
                                                    <FaStar />
                                                    <FaStar />
                                                    <FaStar />
                                                </div>
                                            </div>

                                            <div className="offer-price-section">
                                                <div className="price-badge-premium">
                                                    <span className="price-val">{offer.price}</span>
                                                    <span className="price-unit">د.ك</span>
                                                </div>
                                            </div>

                                            <div className="offer-actions-premium-split">
                                                {offer.status === 0 ? (
                                                    <>
                                                        <button 
                                                            className={`btn-action-premium accept ${hasAcceptedOffer ? 'disabled' : ''}`}
                                                            disabled={hasAcceptedOffer}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOfferAction(offer.id, 1);
                                                            }}
                                                        >
                                                            {t("accept")}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={`status-pill-premium ${offer.status === 1 ? 'accepted' : 'rejected'}`}>
                                                        {offer.status === 1 ? (t('accepted') || 'تم الاختيار') : (t('rejected') || 'تم الرفض')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="offer-merchant-brand-box">
                                            <div className="store-img-container">
                                                {offer.merchant?.image_merchant || offer.merchant?.image_vendor ? (
                                                     <img 
                                                        src={offer.merchant.image_merchant || `http://127.0.0.1:8000/${offer.merchant.image_vendor}`} 
                                                        alt="vendor" 
                                                        onError={(e) => {
                                                            e.target.onerror = null; 
                                                            e.target.src = 'https://via.placeholder.com/100?text=Store';
                                                        }}
                                                     />
                                                ) : (
                                                    <div className="store-img-placeholder"><FaBox size={30} /></div>
                                                )}
                                            </div>
                                            <div className="store-location-info">
                                                <div className="city-name">{offer.merchant?.city?.name || 'الجهراء'}</div>
                                                <div className="mall-name">مجمع البركة التجاري</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isFetchingOffers && <div className="loading-small">{t('loading_more') || 'تحميل المزيد...'}</div>}
                        </div>
                    ) : (
                        <div className="empty-offers">
                            <p>{t('no_offers_yet') || 'لا توجد عروض حتى الآن'}</p>
                        </div>
                    );
                })()}

                    {/* Auction Details Button Moved Here */}
                    <div className="auction-details-btn-wrapper">
                        <button 
                            className="btn-show-product-details-main"
                            onClick={() => setShowDetailsModal(true)}
                        >
                            <FaInfoCircle />
                            {t("auction_details")}
                        </button>
                    </div>
                </div>

                {/* C. Details Modal (Tabs Style like AddDevice) */}
                {showDetailsModal && (
                    <div className="product-details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                        <div className="product-details-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                                    <FaTimes />
                                </button>
                                <h3 className="modal-title">{t('product_details') || 'تفاصيل المنتج'}</h3>
                            </div>

                            <div className="modal-tabs-container">
                                <button 
                                    className={`modal-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('info')}
                                >
                                    <FaBox />
                                    {t("product_information") || "المعلومات"}
                                </button>
                                <button 
                                    className={`modal-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('specs')}
                                >
                                    <FaTools />
                                    {t("device_specifications") || "المواصفات"}
                                </button>
                            </div>

                            <div className="modal-tab-content">
                                {activeTab === 'info' && (
                                    <div className="tab-pane info-pane">
                                        <div className="detail-row">
                                            <span className="detail-label">{t('color') || 'اللون'}</span>
                                            <span className="detail-value">{product.color || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">{t('memory_size') || 'حجم الذاكرة'}</span>
                                            <span className="detail-value">{product.memorysize || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">{t('serial_number') || 'الرقم التسلسلي'}</span>
                                            <span className="detail-value">{product.serialnumber || '-'}</span>
                                        </div>
                                        {product.description && (
                                            <div className="detail-row vertical">
                                                <span className="detail-label">{t('description') || 'الوصف'}</span>
                                                <p className="detail-text">{product.description}</p>
                                            </div>
                                        )}
                                        {product.note && (
                                            <div className="detail-row vertical">
                                                <span className="detail-label">{t('notes') || 'ملاحظات'}</span>
                                                <p className="detail-text note">{product.note}</p>
                                            </div>
                                        )}

                                        {/* Mini Gallery inside modal */}
                                        {imagesList.length > 0 && (
                                            <div className="modal-mini-gallery">
                                                <label className="detail-label">{t('device_images') || 'صور الجهاز'}</label>
                                                <div className="modal-thumbnails">
                                                    {imagesList.map((img, idx) => (
                                                        <img key={idx} src={`http://127.0.0.1:8000/${img}`} alt="thumb" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'specs' && (
                                    <div className="tab-pane specs-pane">
                                        {!details ? (
                                            <div className="empty-specs">{t('no_specs_available') || 'لا توجد مواصفات فنية'}</div>
                                        ) : (
                                            <div className="specs-list-modal">
                                                {allowedSpecs.includes('box') && (
                                                    <div className="spec-item">
                                                        <span className="spec-label">{t('box') || 'كارتون'}</span>
                                                        <span className="spec-value">{details.device_box === '1' ? (t('available') || 'متوفر') : (t('unavailable') || 'غير متوفر')}</span>
                                                    </div>
                                                )}
                                                {allowedSpecs.includes('usage') && (
                                                    <div className="spec-item">
                                                        <span className="spec-label">{t('usage_duration') || 'مدة الاستخدام'}</span>
                                                        <span className="spec-value">{details.device_usage}</span>
                                                    </div>
                                                )}
                                                {allowedSpecs.includes('opened') && (
                                                    <div className="spec-item">
                                                        <span className="spec-label">{t('opened') || 'مفتوح للصيانة'}</span>
                                                        <span className="spec-value">{details.device_opened === '1' ? (t('yes') || 'نعم') : (t('no') || 'لا')}</span>
                                                    </div>
                                                )}
                                                {allowedSpecs.includes('battery') && (
                                                    <div className="spec-item">
                                                        <span className="spec-label">{t('battery') || 'البطارية'}</span>
                                                        <span className="spec-value">{details.device_battery}</span>
                                                    </div>
                                                )}
                                                {/* Cleanliness summary */}
                                                <div className="spec-item">
                                                    <span className="spec-label">{t('cleanliness') || 'النظافة'}</span>
                                                    <span className="spec-value">{details.device_clean}</span>
                                                </div>
                                                
                                                {/* Sensors/Functions grid */}
                                                <div className="modal-specs-grid">
                                                    {details.device_wifi && <div className="grid-spec"><span>{t('wifi')}</span> {details.device_wifi === '1' ? <FaCheckCircle className="status-icon-ok" /> : <FaTimesCircle className="status-icon-no" />}</div>}
                                                    {details.device_bluetooth && <div className="grid-spec"><span>{t('bluetooth')}</span> {details.device_bluetooth === '1' ? <FaCheckCircle className="status-icon-ok" /> : <FaTimesCircle className="status-icon-no" />}</div>}
                                                    {details.device_camera && <div className="grid-spec"><span>{t('camera')}</span> {details.device_camera === '1' ? <FaCheckCircle className="status-icon-ok" /> : <FaTimesCircle className="status-icon-no" />}</div>}
                                                    {details.device_button && <div className="grid-spec"><span>{t('buttons')}</span> {details.device_button === '1' ? <FaCheckCircle className="status-icon-ok" /> : <FaTimesCircle className="status-icon-no" />}</div>}
                                                    {details.device_speaker && <div className="grid-spec"><span>{t('speaker')}</span> {details.device_speaker === '1' ? <FaCheckCircle className="status-icon-ok" /> : <FaTimesCircle className="status-icon-no" />}</div>}
                                                    {details.device_fingerprint && <div className="grid-spec"><span>{t('fingerprint')}</span> {details.device_fingerprint === '1' ? <FaCheckCircle className="status-icon-ok" /> : <FaTimesCircle className="status-icon-no" />}</div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductCustomerDetails;
