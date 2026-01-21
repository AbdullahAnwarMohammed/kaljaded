import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./PaymentSuccess.css";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <div className="payment-success-container">
            <div className="success-card">
                <div className="icon-container">
                    <FaCheckCircle className="success-icon" />
                </div>
                <h1 className="title">{t('payment_success_title')}</h1>
                <p className="message">
                   {t('payment_success_msg')}
                   <br/>
                   {t('payment_success_submsg')}
                </p>
                <div className="actions">
                    <button 
                        className="btn-custom btn-secondary-custom"
                        onClick={() => navigate("/")}
                    >
                        {t('back_home')}
                    </button>
                   
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
