import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowRight, FaBox, FaWifi, FaBluetooth, FaMapMarkerAlt, FaExpand, FaBatteryFull, FaCamera, FaPowerOff, FaVolumeUp, FaFingerprint } from "react-icons/fa";
import Api from "../Services/Api";
import Swal from 'sweetalert2';
import "./ProductCustomerDetails.css";

const ProductCustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await Api.get(`/products-customer/${id}`);
            if (response.data && response.data.success) {
                const p = response.data.data;
                setProduct(p);
                if (p.images && p.images.length > 0) {
                     const imgs = p.images.split(',');
                     setSelectedImage(imgs[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductDetails();
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

    const handleOfferAction = (offerId, newStatus) => {
        const isAccept = newStatus === 1;
        Swal.fire({
            title: isAccept ? (t('confirm_accept_offer') || 'قبول العرض؟') : (t('confirm_reject_offer') || 'رفض العرض؟'),
            text: isAccept ? (t('confirm_accept_text') || '') : (t('confirm_reject_text') || ''),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isAccept ? '#38a169' : '#e53e3e',
            cancelButtonColor: '#718096',
            confirmButtonText: isAccept ? (t('yes_accept') || 'نعم، قبول') : (t('yes_reject') || 'نعم، رفض'),
            cancelButtonText: t('cancel') || 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                Api.put(`/products-customer-offers/${offerId}/status`, { status: newStatus })
                    .then(response => {
                        if (response.data && response.data.success) {
                            Swal.fire({
                                title: t('success') || 'تم بنجاح',
                                text: t('offer_updated_success') || 'تم تحديث الحالة',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
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
        <div className="detail-item">
            <span className="detail-icon">{icon}</span>
            <div className="detail-text">
                <span className="detail-label">{label}</span>
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
                
                {/* 1. Image Gallery Section */}
                {imagesList.length > 0 && (
                    <div className="gallery-section">
                        <div className="main-image-container">
                            <img 
                                src={`http://127.0.0.1:8000/${selectedImage}`} 
                                alt={product.name} 
                                className="main-image"
                            />
                        </div>
                        {imagesList.length > 1 && (
                            <div className="thumbnails-scroll-container">
                                {imagesList.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`thumbnail-item ${selectedImage === img ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={`http://127.0.0.1:8000/${img}`} alt={`thumb-${idx}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Product Header Info */}
                <div className="product-header-section">
                    <div className="product-title-row">
                        <h1 className="product-main-title">{product.name}</h1>
                        <span className={`status-badge-lg ${product.product_active_new === 1 ? 'new' : 'used'}`}>
                            {product.product_active_new === 1 ? (t('new') || 'جديد') : (t('used') || 'مستعمل')}
                        </span>
                    </div>
                    
                    <div className="product-meta-row">
                        {product.category && (
                            <div className="meta-tag category-tag">
                                <FaBox size={14} />
                                <span>{product.category.name}</span>
                            </div>
                        )}
                        <div className="meta-tag date-tag">
                            <span>{product.time_ago}</span>
                        </div>
                    </div>
                </div>

                {/* 3. General Information */}
                <div className="section-block">
                    <h3 className="section-title">{t("product_information") || "معلومات المنتج"}</h3>
                    <div className="info-grid">
                        {renderDetail(<FaBox />, t('color') || 'اللون', product.color)}
                        {renderDetail(<FaBox />, t('memory_size') || 'حجم الذاكرة', product.memorysize)}
                        {renderDetail(<FaBox />, t('serial_number') || 'الرقم التسلسلي', product.serialnumber)}
                    </div>
                    
                    {(product.description || product.note) && (
                        <div className="text-content-wrapper">
                            {product.description && (
                                <div className="text-block">
                                    <label>{t('description') || 'الوصف'}</label>
                                    <p>{product.description}</p>
                                </div>
                            )}
                            {product.note && (
                                <div className="text-block">
                                    <label>{t('notes') || 'ملاحظات'}</label>
                                    <p className="note-text">{product.note}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Technical Details (For Used Items mostly) */}
                {details && (
                    <div className="section-block">
                        <h3 className="section-title">{t("device_specifications") || "مواصفات الجهاز"}</h3>
                        <div className="specs-grid">
                            
                            {/* Always show if allowed and present */}
                            {allowedSpecs.includes('box') && renderDetail(<FaBox />, t('box') || 'كارتون', details.device_box === '1' ? (t('available') || 'متوفر') : (details.device_box === '0' ? (t('unavailable') || 'غير متوفر') : details.device_box))}
                            
                            {allowedSpecs.includes('usage') && renderDetail(<FaExpand />, t('usage_duration') || 'مدة الاستخدام', details.device_usage)}
                            
                            {allowedSpecs.includes('condition') && renderDetail(<FaExpand />, t('condition') || 'حالة الجهاز', details.device_condition)}
                            
                            {allowedSpecs.includes('opened') && renderDetail(<FaPowerOff />, t('opened') || 'مفتوح للصيانة', details.device_opened === '1' ? (t('yes') || 'نعم') : (t('no') || 'لا'))}
                            
                            {/* Cleanliness maps to multiple fields */}
                            {allowedSpecs.includes('cleanliness') && (
                                <>
                                    {renderDetail(<FaBox />, t('cleanliness') || 'النظافة', details.device_clean)}
                                    {renderDetail(<FaBox />, t('screen_status') || 'حالة الشاشة', details.device_display)}
                                    {renderDetail(<FaBox />, t('body_status') || 'حالة الجسم', details.device_body)}
                                </>
                            )}
                            
                            {allowedSpecs.includes('battery') && renderDetail(<FaBatteryFull />, t('battery') || 'البطارية', details.device_battery)}
                            
                            {allowedSpecs.includes('wifi') && details.device_wifi && renderDetail(<FaWifi />, t('wifi') || 'الواي فاي', details.device_wifi === '1' ? (t('working') || 'يعمل') : (t('not_working') || 'لا يعمل'))}
                            
                            {allowedSpecs.includes('bluetooth') && details.device_bluetooth && renderDetail(<FaBluetooth />, t('bluetooth') || 'البلوتوث', details.device_bluetooth === '1' ? (t('working') || 'يعمل') : (t('not_working') || 'لا يعمل'))}
                            
                            {allowedSpecs.includes('gps') && details.device_gps && renderDetail(<FaMapMarkerAlt />, t('gps') || 'GPS', details.device_gps === '1' ? (t('working') || 'يعمل') : (t('not_working') || 'لا يعمل'))}
                            
                            {allowedSpecs.includes('sensors') && details.device_sensors && renderDetail(<FaExpand />, t('sensors') || 'الحساسات', details.device_sensors === '1' ? (t('working') || 'تعمل') : (t('not_working') || 'لا تعمل'))}
                            
                            {allowedSpecs.includes('camera') && details.device_camera && renderDetail(<FaCamera />, t('camera') || 'الكاميرا', details.device_camera === '1' ? (t('working') || 'تعمل') : (t('not_working') || 'لا تعمل'))}
                            
                            {allowedSpecs.includes('buttons') && details.device_button && renderDetail(<FaPowerOff />, t('buttons') || 'الأزرار', details.device_button === '1' ? (t('working') || 'تعمل') : (t('not_working') || 'لا تعمل'))}
                            
                            {allowedSpecs.includes('speaker') && details.device_speaker && renderDetail(<FaVolumeUp />, t('speaker') || 'السماعة', details.device_speaker === '1' ? (t('working') || 'تعمل') : (t('not_working') || 'لا تعمل'))}
                            
                            {allowedSpecs.includes('fingerprint') && details.device_fingerprint && renderDetail(<FaFingerprint />, t('fingerprint') || 'البصمة', details.device_fingerprint === '1' ? (t('working') || 'تعمل') : (t('not_working') || 'لا تعمل'))}
                        </div>
                    </div>
                )}

                {/* 5. Offers Section */}
                <div className="section-block offers-block">
                    <div className="offers-header-row">
                        <h3 className="section-title">{t("offers") || "العروض"} 
                            {product.offers && <span className="offers-badge">{product.offers.length}</span>}
                        </h3>
                    </div>
                    
                    {product.offers && product.offers.length > 0 ? (
                        <div className="offers-list">
                            {product.offers.map((offer) => (
                                <div key={offer.id} className="offer-item-card">
                                    <div className="offer-main-row">
                                        <div className="merchant-info">
                                            <div className="merchant-avatar-placeholder">{offer.merchant?.name?.charAt(0) || 'M'}</div>
                                            <div className="merchant-details">
                                                <Link to={`/merchants/${offer.merchant_id}`} className="merchant-name-link">
                                                    <span className="merchant-name-text">{offer.merchant?.name || 'Merchant'}</span>
                                                </Link>
                                                <span className="offer-time-text">{new Date(offer.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="offer-price-tag">
                                            {offer.price} KWD
                                        </div>
                                    </div>
                                    
                                    <div className="offer-actions">
                                        {offer.status === 0 ? (
                                            <>
                                                <button 
                                                    className="offer-btn accept-btn"
                                                    onClick={() => handleOfferAction(offer.id, 1)}
                                                >
                                                    {t('accept') || 'موافق'}
                                                </button>
                                                <button 
                                                    className="offer-btn reject-btn"
                                                    onClick={() => handleOfferAction(offer.id, 2)}
                                                >
                                                    {t('reject') || 'رفض'}
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`status-label ${offer.status === 1 ? 'status-accepted' : 'status-rejected'}`}>
                                                {offer.status === 1 ? (t('accepted') || 'تمت الموافقة') : (t('rejected') || 'تم الرفض')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-offers">
                            <p>{t('no_offers_yet') || 'لا توجد عروض حتى الآن'}</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProductCustomerDetails;
