import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";
import "./PaymentSuccess.css";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import Api from "../../Services/Api";

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const [searchParams] = useSearchParams();
    const reference = searchParams.get("reference") || searchParams.get("order_reference");
    
    const [status, setStatus] = useState("loading"); // loading, success, error
    const [message, setMessage] = useState("");

    const hasCalled = React.useRef(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;

            if (!reference) {
                setStatus("error");
                setMessage("No payment reference found.");
                return;
            }

            try {
                // Call backend to confirm order
                const res = await Api.post('/payment/deema/success', { reference });
                console.log(res);
                // Even if "Order already created", it's a success for the user
                if (res.status === 200 || res.data.message === 'Order already created') {
                    setStatus("success");
                    fetchCart(); // Refresh cart (should be empty now)
                } else {
                    setStatus("error");
                    setMessage(res.data.message || "Payment verification failed.");
                }
            } catch (err) {
                console.log(err);
                console.error("Payment Confirmation Error:", err);
                // If it fails with 410 (Already consumed cache) potentially ignore if we assume it was us?
                // But better to just preventing double call which we did.
                setStatus("error");
                setMessage(err.response?.data?.message || "An error occurred while verifying payment.");
            }
        };

        confirmPayment();
    }, [reference, fetchCart]);

    return (
        <div className="payment-success-container">
            <div className="success-card">
                <div className="icon-container">
                    {status === "loading" && <FaSpinner className="spinner-icon" style={{ animation: "spin 1s linear infinite" }} />}
                    {status === "success" && <FaCheckCircle className="success-icon" />}
                    {status === "error" && <FaTimesCircle className="error-icon" style={{ color: "red" }} />}
                </div>

                {status === "loading" && (
                    <>
                        <h1 className="title">جاري التحقق...</h1>
                        <p className="message">يرجى الانتظار بينما نقوم بتأكيد طلبك.</p>
                    </>
                )}

                {status === "success" && (
                    <>
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
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 className="title">خطأ في التحقق</h1>
                        <p className="message" style={{ color: "red" }}>{message}</p>
                        <div className="actions">
                            <button 
                                className="btn-custom btn-secondary-custom"
                                onClick={() => navigate("/")}
                            >
                                {t('back_home')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
