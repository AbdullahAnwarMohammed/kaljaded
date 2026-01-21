import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight, FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { BsBoxSeam } from "react-icons/bs"; 
import "./RequestProduct.css";

const RequestProduct = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === "ar";

    const handleBack = () => {
        navigate(-1);
    };

    const handleWhatsapp = () => {
        window.open("https://wa.me/+96567691171", "_blank"); 
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleWhatsapp();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="request-product-wrapper">
            {/* Header */}
            <div className="request-product-header">
                 <div className="d-flex align-items-center gap-2">
                    {/* Placeholder for future icons */}
                </div>
                <h5>{t("products") || "المنتجات"}</h5>
               <button
                    onClick={handleBack}
                    className="back-button"
                    style={{ transform: isRTL ? "rotate(180deg)" : "none" }}
                >
                   {/* Placeholder for back icon */}
                </button>
            </div>

            {/* Content */}
            <div className="request-product-content">
                <div className="text-center">
                    <BsBoxSeam size={80} className="empty-state-icon" />
                    <h5 className="empty-state-text">{t("no_products")}</h5>
                </div>

                <div className="whatsapp-button-container">
                    <button
                        onClick={handleWhatsapp}
                        className="btn whatsapp-button"
                    >
                        <FaWhatsapp size={20} />
                        <span>{t("contact_us_whatsapp")}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestProduct;
