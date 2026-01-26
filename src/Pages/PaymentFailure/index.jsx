import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import "./PaymentFailure.css";

const PaymentFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

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

                {/* Developer Error Display */}
                {(searchParams.get('error') || searchParams.get('status')) && (
                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3f3', border: '1px solid red', borderRadius: '8px', fontSize: '14px', color: '#d32f2f' }}>
                        <strong>Error Details (Dev):</strong> <br/>
                        {searchParams.get('error') || ('Status: ' + searchParams.get('status'))}
                    </div>
                )}

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
