import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import Api from '../../Services/Api';
import './Checkout.css';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';

const CheckoutTabs = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const [activeTab, setActiveTab] = useState(1);
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        city: '',
        area: '',
        block: '4',
        street: '4',
        building: '4',
        floor: '',
        apartment: '',
        latitude: '',
        longitude: ''
    });

    const [loading, setLoading] = useState(true);
    const [cartTotal, setCartTotal] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null); // 'deema', 'cod' or ID

    useEffect(() => {
        Api.get('/profile')
            .then(res => {
                if(res.data.success) {
                    const user = res.data.data.user;
                    
                    // Check if required fields are present
                    const isProfileComplete = 
                        user.name &&
                        user.phone &&
                        user.city_id &&
                        user.area_id &&
                        user.block &&
                        user.street &&
                        user.building;
                    
                    if (isProfileComplete) {
                        setActiveTab(2);
                    }

                    setFormData(prev => ({
                        ...prev,
                        name: user.name || '',
                        phone: user.phone || '', 
                        city: user.city_id || '',
                        area: user.area_id || '',
                        cityName: user.city ? (i18n.language === 'en' ? user.city.name_en : user.city.name_ar) : '',
                        areaName: user.area ? (i18n.language === 'en' ? user.area.name_en : user.area.name_ar) : '',
                        block: user.block || '',
                        street: user.street || '',
                        building: user.building || '',
                        floor: user.floor || '',
                        apartment: user.apartment || '',
                        latitude: user.latitude || '',
                        longitude: user.longitude || ''
                    }));
                }
            })
            .catch(err => console.error("Error fetching profile", err))
            .finally(() => setLoading(false));

        // Fetch cart total
        Api.get('/cart')
            .then(res => {
                if(res.data.success) {
                    setCartTotal(res.data.data.cart.total);
                }
            })
            .catch(err => console.error("Error fetching cart", err));

        // Fetch Payment Methods
        Api.get('/payment/myfatoorah/initiate')
            .then(res => {
                console.log("MyFatoorah Initiate Response:", res); // Debug log
                if (res.data.success) {
                    setPaymentMethods(res.data.data.PaymentMethods);
                } else {
                    console.error("MyFatoorah Initiate Failed:", res.data.message);
                }
            })
            .catch(err => console.error("Error fetching payment methods", err));
    }, [i18n.language]); // Refetch/re-render when language changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone") {
            if (!value.startsWith("965")) {
                return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => {
        setLoading(true);
        Api.post('/profile/update', formData)
            .then(res => {
                if(res.data.success) {
                    console.log("Profile updated successfully");
                }
            })
            .catch(err => {
                console.error("Error updating profile", err);
            })
            .finally(() => {
                setLoading(false);
                setActiveTab(2);
                window.scrollTo(0, 0);
            });
    };

    const handleBackStep = () => {
        setActiveTab(1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = (paymentMethod, gatewayId = null) => {
        setLoading(true);
        // Combine formData with selected payment method
        const payload = {
            ...formData,
            payment_method: paymentMethod,
            gateway_id: gatewayId
        };

        if (paymentMethod === 'deema') {
            const deemaPayload = {
                customer_name: formData.name,
                customer_phone: formData.phone,
                latitude: formData.latitude,
                longitude: formData.longitude,
                useraddress: `${formData.cityName || ''} ${formData.areaName || ''} قطعة:${formData.block} شارع:${formData.street} قسيمة/بناية:${formData.building}`,
            };

            Api.post('/payment/deema/checkout', deemaPayload)
                .then(res => {
                    if (res.data?.data?.redirect_link) {
                        window.location.href = res.data.data.redirect_link;
                    } else if (res.data?.redirect_link) {
                         window.location.href = res.data.redirect_link;
                    } else {
                        console.error("No redirect link found", res.data);
                        alert(t("error_occurred") || "Error occurred during Deema checkout");
                    }
                })
                .catch(err => {
                    console.error("Deema checkout failed", err);
                    alert(t("error_occurred") || "Error occurred during Deema checkout");
                })
                .finally(() => setLoading(false));
            return;
        }

        Api.post('/payment/myfatoorah/checkout', payload)
            .then(res => {
                console.log(res);
                if(res.data.success) {
                    if (res.data.url) {
                        // Redirect to MyFatoorah
                        window.location.href = res.data.url;
                    } else {
                        // COD or success without redirect
                        fetchCart();
                        navigate('/payment-success');
                    }
                }
            })
            .catch(err => {
                console.error("Checkout validation failed", err);
                // Handle error (show message to user)
            })
            .finally(() => setLoading(false));
    };

    const handleLocationUpdate = (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        
        // Immediate API update as requested
        Api.post('/profile/update', { ...formData, latitude: lat, longitude: lng })
            .then(res => {
                if(res.data.success) {
                    console.log("Location updated successfully");
                }
            })
            .catch(err => console.error("Error updating location", err));
    };

    if (loading) {
        return (
            <div className="checkout-page" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('loading')}...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <header className="checkout-header">
                <div className="checkout-header-top">
                    <div></div> {/* Spacer for center alignment logic if needed, or user profile icon */}
                    <div style={{ fontSize: '1.2rem' }}>
                        {activeTab === 1 ? t('checkout_data') : t('checkout_payment')}
                    </div>
                    <Link to="/carts" className="back-arrow">
                        <FaArrowRight />
                    </Link>
                </div>

                {/* Custom Progress Bar */}
                <div className="checkout-steps">
                    <div className="step-line"></div>

                    <div className="step-names">
                        <span 
                            className={`step-1 ${activeTab === 1 ? 'active' : ''}`}
                            onClick={() => setActiveTab(1)}
                            style={{ cursor: 'pointer' }}
                        >
                            {t('checkout_data')}
                        </span>
                        <span 
                            className={`step-2 ${activeTab === 2 ? 'active' : ''}`}
                            onClick={() => setActiveTab(2)}
                            style={{ cursor: 'pointer' }}
                        >
                            {t('checkout_payment')}
                        </span>
                    </div>

                    <div 
                        className={`step-indicator step-1 ${activeTab >= 1 ? 'active' : ''}`}
                        onClick={() => setActiveTab(1)}
                        style={{ cursor: 'pointer' }}
                    >
                        {activeTab > 1 ? <FaCheck /> : '1'}
                    </div>

                    <div 
                        className={`step-indicator step-2 ${activeTab === 2 ? 'active' : ''}`}
                        onClick={() => setActiveTab(2)}
                        style={{ cursor: 'pointer' }}
                    >
                        2
                    </div>
                </div>
            </header>

            <div className="checkout-container">
                {activeTab === 1 && (
                    <AddressForm
                        formData={formData}
                        handleChange={handleInputChange}
                        onNext={handleNextStep}
                        onLocationUpdate={handleLocationUpdate}
                        paymentMethod={selectedMethod}
                    />
                )}

                {activeTab === 2 && (
                    <PaymentForm
                        formData={formData}
                        cartTotal={cartTotal}
                        paymentMethods={paymentMethods}
                        onBack={handleBackStep}
                        onSubmit={handleSubmit}
                        selectedMethodId={selectedMethod}
                        setSelectedMethodId={setSelectedMethod}
                    />
                )}
            </div>
        </div>
    );
};

export default CheckoutTabs;
