import React, { useState, useEffect } from 'react'
import "./Header.css"
import "./AppBanner.css"
import "./AppBannerStoreLinks.css"
import Logo from "../../assets/logo.png";
import ArImage from "../../assets/ar.png";
import EnImage from "../../assets/en.png";
import { Link, useNavigate } from "react-router-dom";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { FaRegUserCircle } from "react-icons/fa";
import { MdContactMail } from "react-icons/md";
import { CiCircleInfo } from "react-icons/ci";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { MdLanguage } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import { useCart } from "../../context/CartContext";

import AppleStore from "../../assets/applestore.png"
import GooglePlay from "../../assets/googleplay.png"

const Header = () => {
  const { t, i18n } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [languagePopup, setLanguagePopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { fetchCart, setCart } = useCart(); // Access cart methods
  const [downloadLink, setDownloadLink] = useState("https://play.google.com/store/apps/details?id=kaljaded.com");
  const [shouldRenderBanner, setShouldRenderBanner] = useState(false);
  const [isBannerClosing, setIsBannerClosing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) setIsLoggedIn(true);

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setDownloadLink("https://apps.apple.com/us/app/%D9%83%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF/id6746918468");
    }

    // Show banner after 5 seconds
    const timer = setTimeout(() => {
      setShouldRenderBanner(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseBanner = () => {
    setIsBannerClosing(true);
    setTimeout(() => {
      setShouldRenderBanner(false);
      setIsBannerClosing(false); // Reset for potential re-show if logic changes later
    }, 1000); // Match animation duration
  };

  // Auto-close banner after 7 seconds if not interacted with
  useEffect(() => {
    let autoCloseTimer;
    if (shouldRenderBanner) {
      autoCloseTimer = setTimeout(() => {
        handleCloseBanner();
      }, 7000);
    }
    return () => clearTimeout(autoCloseTimer);
  }, [shouldRenderBanner]);

  const handleLogout = async () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer");
    setIsLoggedIn(false);
    setOpenMenu(false);
    
    // Clear cart state immediately
    setCart(null); 
    // Fetch fresh cart (will be guest cart)
    await fetchCart(); 
    
    navigate("/");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguagePopup(false);
  };

  return (
    <>
      {shouldRenderBanner && (
        <div className={`app-banner ${isBannerClosing ? 'closing' : 'opening'}`}>
          <div className="container">
            <div className="banner-content">
              <div className="close-banner" onClick={handleCloseBanner}>
                <RiCloseLine />
              </div>
              <a href={downloadLink} className="banner-click-area" target="_blank" rel="noopener noreferrer">
                <div className="banner-text-container">
                  <span className={`banner-small-title ${downloadLink.includes("apps.apple.com") ? "store-blue" : "play-green"}`}>{downloadLink.includes("apps.apple.com") ? t("app_store") : t("google_play")}</span>
                  <span className="banner-text">{t('download_app_now')}</span>
                </div>
                <img src={downloadLink.includes("apps.apple.com") ? AppleStore : GooglePlay} alt="App Icon" className="banner-icon-img" />
              </a>
            </div>
          </div>
        </div>
      )}
      <div className='header'>
        <div className="container">
          <div className="app-header">
            <div className="menu-icon" onClick={() => setOpenMenu(true)}>
              <RiMenu3Line />
            </div>
            <Link to="/" className="logo">
              <img src={Logo} alt="" />
            </Link>
            <a href={downloadLink} className='download-app' target="_blank" rel="noopener noreferrer">
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
          <li><Link to="/about-us"><CiCircleInfo /> {t("about")}</Link></li>
          <li><Link to="/privacy-policy"><MdOutlinePrivacyTip /> {t("privacy_policy")}</Link></li>
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
