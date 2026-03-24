import React, { useState } from "react";
import { FaEdit, FaApple, FaCreditCard, FaTruck, FaCheck, FaCcVisa, FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { MdOutlinePayment } from "react-icons/md";
import { CiDeliveryTruck } from "react-icons/ci";

import deema_image from "../../assets/dema-logo.png";

const PaymentForm = ({ formData, onBack, onSubmit, cartTotal, paymentMethods = [], selectedMethodId, setSelectedMethodId }) => {
    const { t, i18n } = useTranslation();
    // Use props instead of local state for consistency across tabs

    // Address Validation
    const requiredFields = selectedMethodId === 'cod'
        ? [
            { key: 'city', label: t('city') },
            { key: 'area', label: t('area') },
            { key: 'block', label: t('block_placeholder') },
            { key: 'street', label: t('street_placeholder') },
            { key: 'building', label: t('building_placeholder') },
            { key: 'phone', label: t('phone') }
          ]
        : [
            { key: 'city', label: t('city') }
          ];

    const missingFields = requiredFields.filter(field => !formData[field.key]);
    const isAddressComplete = missingFields.length === 0;

    const handleConfirm = () => {
        if (!selectedMethodId) return; // Add check for null

        if (selectedMethodId === 'cod') {
            onSubmit('cod');
        } else if (selectedMethodId === 'deema') {
            onSubmit('deema');
        } else {
            // It's an API method (KNET/Visa)
            // Send 'myfatoorah' as general type + the specific ID
            onSubmit('myfatoorah', selectedMethodId);
        }
    };

    // Helper to get localized name
    const getMethodName = (method) => {
        if (!method) return "";
        return i18n.language === 'ar' ? (method.PaymentMethodAr || method.PaymentMethodEn) : method.PaymentMethodEn;
    };

    // Filter methods based on names (using loose matching)
    const knetMethod = paymentMethods.find(m => m.PaymentMethodEn.toLowerCase().includes('knet'));
    const applePayMethod = paymentMethods.find(m => m.PaymentMethodEn.toLowerCase().includes('apple'));
    // Other methods that aren't KNET or Apple Pay
    const otherMethods = paymentMethods.filter(m => 
        !m.PaymentMethodEn.toLowerCase().includes('knet') && 
        !m.PaymentMethodEn.toLowerCase().includes('apple')
    );

    return (
        <>
            {/* Warning Message for Incomplete Address */}
            {!isAddressComplete && (
                <div className="address-warning-container">
                    <div className="warning-header">
                        <FaExclamationTriangle />
                        <span>{t('missing_address_title')}</span>
                    </div>
                    <div className="warning-list">
                        <span>{t('missing_address_msg')}</span>
                        <ul>
                            {missingFields.map((field) => (
                                <li key={field.key}>{field.label}</li>
                            ))}
                        </ul>
                    </div>
                    <button className="update-address-btn-link" onClick={onBack}>
                        {t('update_address_btn')}
                    </button>
                </div>
            )}

            <div className="form-card">
                <div className="form-section-title">
                    {t('payment_methods_title')}
                </div>

                {/* Deema Installments */}
                <div
                    className={`payment-option ${selectedMethodId === "deema" ? "selected" : ""}`}
                    onClick={() => setSelectedMethodId("deema")}
                >
                    <div className="payment-info">
                        <img src={deema_image} className="payment-method-icon" style={{objectFit: 'contain'}} width={24} height={24} alt="Deema" />
                        <span className="payment-option-text">
                            {t('install_with_deema')}
                        </span>
                    </div>

                    <div className="checkmark-icon">
                        <FaCheck />
                    </div>
                </div>

                {/* 1. KNET */}
                {knetMethod && (
                    <div
                        key={knetMethod.PaymentMethodId}
                        className={`payment-option ${selectedMethodId === knetMethod.PaymentMethodId ? "selected" : ""}`}
                        onClick={() => setSelectedMethodId(knetMethod.PaymentMethodId)}
                    >
                        <div className="payment-info">
                            <MdOutlinePayment className="payment-method-icon" size={24} color="#2d3436" />
                            <span className="payment-option-text">
                                {t('pay_knet')}
                            </span>
                        </div>

                        <div className="checkmark-icon">
                            <FaCheck />
                        </div>
                    </div>
                )}

                {/* 2. Apple Pay */}
                {applePayMethod && (
                    <div
                        key={applePayMethod.PaymentMethodId}
                        className={`payment-option ${selectedMethodId === applePayMethod.PaymentMethodId ? "selected" : ""}`}
                        onClick={() => setSelectedMethodId(applePayMethod.PaymentMethodId)}
                    >
                        <div className="payment-info">
                             <FaApple className="payment-method-icon" size={24} color="#2d3436" />
                            <span className="payment-option-text">
                                {t('pay_apple')}
                            </span>
                        </div>

                        <div className="checkmark-icon">
                            <FaCheck />
                        </div>
                    </div>
                )}

                 {/* Other Dynamic Methods */}
                 {otherMethods.map((method) => (
                     <div
                        key={method.PaymentMethodId}
                        className={`payment-option ${selectedMethodId === method.PaymentMethodId ? "selected" : ""}`}
                        onClick={() => setSelectedMethodId(method.PaymentMethodId)}
                    >
                        <div className="payment-info">
                           <FaCcVisa    size={24} color="#2d3436" />
                            <span className="payment-option-text">
                                {getMethodName(method)}
                            </span>
                        </div>

                        <div className="checkmark-icon">
                            <FaCheck />
                        </div>
                    </div>
                ))}


            </div>

            <div className="form-card">
                <div className="form-section-title">
                    {t('address_title')}
                </div>
                <div className="address-summary-box">
                    <FaEdit className="edit-icon" onClick={onBack} />
                    <span>
                        {formData.cityName} - {formData.areaName} - {formData.block} - {formData.street}
                    </span>
                </div>
            </div>

            <div className="form-card">
                 {/* 3. Cash On Delivery (Moved below address) */}
                 <div
                    className={`payment-option ${selectedMethodId === "cod" ? "selected" : ""}`}
                    onClick={() => setSelectedMethodId("cod")}
                >
                    <div className="payment-info">
                        <CiDeliveryTruck  className="payment-method-icon" size={24} color="#2d3436" />
                        <span className="payment-option-text">{t('pay_cod')}</span>
                    </div>

                    <div className="checkmark-icon">
                        <FaCheck />
                    </div>
                </div>
            </div>

            <div className="form-card">
                <div className="form-section-title">
                    {t('order_summary')}
                </div>
                <table className="summary-table">
                    <tbody>
                        <tr>
                            <td>{t('products_value')}</td>
                            <td className="text-left" style={{ textAlign: 'left' }}>K.D {parseFloat(cartTotal).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>{t('delivery')}</td>
                            <td className="text-left" style={{ textAlign: 'left' }}>{t('free')}</td>
                        </tr>
                        <tr className="total-row">
                            <td>{t('total')} :</td>
                            <td className="text-left" style={{ textAlign: 'left' }}>K.D {parseFloat(cartTotal).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button 
                className={`btn-next ${(!isAddressComplete || !selectedMethodId) ? 'disabled' : ''}`} 
                onClick={isAddressComplete && selectedMethodId ? handleConfirm : null}
                disabled={!isAddressComplete || !selectedMethodId}
                style={{ opacity: (!isAddressComplete || !selectedMethodId) ? 0.5 : 1, cursor: (!isAddressComplete || !selectedMethodId) ? 'not-allowed' : 'pointer' }}
            >
                {t('confirm_payment')}
            </button>
        </>
    );
};

export default PaymentForm;
