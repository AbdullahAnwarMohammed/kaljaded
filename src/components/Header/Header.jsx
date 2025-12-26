import React, { useState, useEffect } from 'react'
import "./Header.css"
import Logo from "../../assets/logo.png";
import ArImage from "../../assets/ar.png";
import EnImage from "../../assets/en.png";
import { IoMdAppstore } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { FaRegUserCircle } from "react-icons/fa";
import { MdContactMail } from "react-icons/md";
import { CiCircleInfo } from "react-icons/ci";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { MdLanguage } from "react-icons/md";
import { useTranslation } from 'react-i18next';
const Header = () => {
  const { t, i18n } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [languagePopup, setLanguagePopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer");
    setIsLoggedIn(false);
    setOpenMenu(false);
    navigate("/");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguagePopup(false);
  };

  return (
    <>
      <div className='header'>
        <div className="container">
          <div className="app-header">
            <div className="menu-icon" onClick={() => setOpenMenu(true)}>
              <RiMenu3Line />
            </div>
            <Link to="/" className="logo">
              <img src={Logo} alt="" />
            </Link>
            <a href="#" className='download-app'>
             {t("download_app")}
            </a>
          </div>
        </div>
      </div>

      {openMenu && <div className="overlay" onClick={() => setOpenMenu(false)}></div>}

      <div className={`side-menu ${openMenu ? "show" : ""}`}>
        <div className="close-btn" onClick={() => setOpenMenu(false)}>
          <RiCloseLine />
        </div>
        <img src={Logo} className='logo-menu' alt="Logo" />
        <ul>
          {isLoggedIn ? (
            <li onClick={handleLogout}><FaRegUserCircle /> {t("logout")}</li>
          ) : (
            <li>
              <Link to="/login-customer"><FaRegUserCircle /> {t("login")}</Link>
            </li>
          )}
          <li><Link to="/contact-us"><MdContactMail /> {t("contact_us")}</Link></li>
          {/* <li><Link to="/about"><CiCircleInfo /> {t("about")}</Link></li>
          <li><Link to="/contact"><MdOutlinePrivacyTip /> {t("privacy_policy")}</Link></li> */}
          <li onClick={() => setLanguagePopup(true)}><MdLanguage /> {t("choose_language")}</li>
        </ul>
      </div>

      {languagePopup && (
        <div className="language-popup">
          <div className="popup-overlay" onClick={() => setLanguagePopup(false)}></div>
          <div className="popup-content">
            <h3>{t("choose_language")}</h3>
            <button onClick={() => changeLanguage("ar")}>
              <img src={ArImage} alt="Arabic" /> {t("arabic")}
            </button>
            <button onClick={() => changeLanguage("en")}>
              <img src={EnImage} alt="English" /> {t("english")}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Header;
