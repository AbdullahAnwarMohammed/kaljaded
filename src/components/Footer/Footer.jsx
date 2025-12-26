import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import { FaHome, FaDumpsterFire, FaHandHoldingHeart } from "react-icons/fa";
import { CiShoppingCart } from "react-icons/ci";
import { IoIosAddCircle } from "react-icons/io";
import { MdFavorite } from "react-icons/md";

import "./Footer.css";
import { useCart } from "../../context/CartContext";
import { FavoritesContext } from "../../context/FavoritesContext"; // تأكد من المسار الصحيح
import { FaBuildingUser } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();

    const { cartCount } = useCart();
    // const { favorites } = useContext(FavoritesContext); // هنا جلبنا state المفضلة

    return (
        <div className="component-footer">
            <div className="footer-mobile">
                <div className="item">
                    <Link to="/" className="your-class">
                        <FaHome />
                        <p>{t("home")}</p>
                    </Link>
                </div>
                <div className="item">
                    <a href="/merchants">
                        <FaBuildingUser />
                        <p>{t("merchants")}</p>
                    </a>
                </div>
                {/* <div className="item">
                <a href="#">
                    <IoIosAddCircle />
                    <p>{t("add")}</p>
                </a>
            </div> */}
                <div className="item">
                    <Link to="/installments">
                        <FaDumpsterFire />
                        <p>{t("installments")}</p>
                    </Link>
                </div>
                <div className="item">
                    <Link to="/carts" className="your-class">
                        <span className='badge bg-danger'>{cartCount}</span>
                        <CiShoppingCart />
                        <p>{t("cart")}</p>
                    </Link>
                </div>
                {/* <div className="item">
                    <Link to="/favs" className="favs">
                        <span className='badge bg-danger'>{favorites.length}</span>
                        <MdFavorite />
                        <p>{t("favorites")}</p>
                    </Link>
                </div> */}
            </div>
        </div>
    )

}

export default Footer;
