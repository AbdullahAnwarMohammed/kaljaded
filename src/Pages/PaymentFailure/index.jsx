import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import "./PaymentFailure.css";

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-failure-container">
            <div className="failure-card">
                <div className="icon-container-failure">
                    <FaTimesCircle className="failure-icon" />
                </div>
                <h1 className="title">فشلت عملية الدفع</h1>
                <p className="message">
                   للأسف، لم نتمكن من إتمام عملية الدفع.
                   <br/>
                   يرجى التأكد من بيانات البطاقة أو المحاولة مرة أخرى.
                </p>
                <div className="actions">
                    <button 
                        className="btn-custom btn-secondary-custom"
                        onClick={() => navigate("/")}
                    >
                        العودة للرئيسية
                    </button>
                    <button 
                        className="btn-custom btn-danger-custom"
                        onClick={() => navigate("/carts")} // Assuming retry means going back to cart/checkout
                    >
                        حاول مرة أخرى
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
