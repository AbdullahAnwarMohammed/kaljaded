import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";
import { 
    RiHomeLine, RiHomeFill,
    RiStoreLine, RiStoreFill,
    RiWallet3Line, RiWallet3Fill,
    RiShoppingCartLine, RiShoppingCartFill 
} from "react-icons/ri";

import "./Footer.css";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();
    const { cartCount, cart } = useCart();
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    const totalPrice = cart?.total_price || cart?.total || 0; 
    const showBanner = cartCount > 0 && isBannerVisible;

    const handleCloseBanner = (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        setIsBannerVisible(false);
        setTimeout(() => {
            setIsBannerVisible(true);
        }, 300000);
    };

    return (
        <div className="component-footer">
            {showBanner && (
                <NavLink to="/carts" className="cart-notification-banner">
                    <div 
                        className="banner-close-btn"
                        onClick={handleCloseBanner}
                    >
                        <FaTimes size={14} color="white" />
                    </div>
                    <div className="cart-notification-price">
                        {totalPrice} K.D
                    </div>
                    <div className="cart-notification-text">
                        {t("cart_notification_msg", { count: cartCount })}
                        <RiShoppingCartFill className="cart-icon" />
                    </div>
                </NavLink>
            )}
            <div className="footer-mobile">

                <div className="item">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive ? "footer-link active" : "footer-link"
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive ? <RiHomeFill /> : <RiHomeLine />}
                                <p>{t("home")}</p>
                            </>
                        )}
                    </NavLink>
                </div>

                <div className="item">
                    <NavLink
                        to="/merchants"
                        className={({ isActive }) =>
                            isActive ? "footer-link active" : "footer-link"
                        }
                    >
                         {({ isActive }) => (
                            <>
                                {isActive ? <RiStoreFill /> : <RiStoreLine />}
                                <p>{t("merchants")}</p>
                            </>
                        )}
                    </NavLink>
                </div>


                <div className="item added">
                    <NavLink
                        to="/request-product"
                        className={({ isActive }) =>
                            isActive ? "footer-link active" : "footer-link"
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <CiCirclePlus />
                                <p>{t("add")}</p>
                            </>
                        )}
                    </NavLink>
                </div>
                <div className="item">
                    <NavLink
                        to="/category/installments"
                        className={({ isActive }) =>
                            isActive ? "footer-link active" : "footer-link"
                        }
                    >
                         {({ isActive }) => (
                            <>
                                {isActive ? <RiWallet3Fill /> : <RiWallet3Line />}
                                <p>{t("installments")}</p>
                            </>
                        )}
                    </NavLink>
                </div>


                <div className="item">
                    <NavLink
                        to="/carts"
                        className={({ isActive }) =>
                            isActive ? "footer-link active" : "footer-link"
                        }
                    >
                         {({ isActive }) => (
                            <>
                                <span className="badge bg-danger">{cartCount}</span>
                                {isActive ? <RiShoppingCartFill /> : <RiShoppingCartLine />}
                                <p>{t("cart")}</p>
                            </>
                        )}
                    </NavLink>
                </div>

            </div>
        </div>
    );
};

export default Footer;
