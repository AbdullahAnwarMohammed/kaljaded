import React, { useState, useEffect } from 'react'
import "./Header.css"
import "./AppBanner.css"
import "./AppBannerStoreLinks.css"
import "./SidebarHeader.css"
import Logo from "../../assets/logo.png";
import ArImage from "../../assets/ar.png";
import EnImage from "../../assets/en.png";
import { Link, useNavigate } from "react-router-dom";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import { MdContactMail } from "react-icons/md";
import { CiCircleInfo } from "react-icons/ci";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { ImUser } from "react-icons/im";
import { FaMobileAlt } from "react-icons/fa";
import { MdLanguage } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import { useCart } from "../../context/CartContext";

import AppleStore from "../../assets/applestore.png"
import GooglePlay from "../../assets/googleplay.png"
import Api from "../../Services/Api";

const Header = () => {
  const { t, i18n } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [languagePopup, setLanguagePopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { fetchCart, setCart } = useCart();
  const [downloadLink, setDownloadLink] = useState("https://play.google.com/store/apps/details?id=kaljaded.com");
  
  const [isBannerMounted, setIsBannerMounted] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [stats, setStats] = useState({ daily: [], monthly: [] });
  const [touchStartY, setTouchStartY] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  useEffect(() => {
      if (openMenu) {
          Api.get('/site-stats', { skipLoader: true }).then(res => {
              if (res.data.success) {
                  setStats(res.data.data);
              }
          }).catch(err => console.error(err));
      }
  }, [openMenu]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) setIsLoggedIn(true);

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setDownloadLink("https://apps.apple.com/us/app/%D9%83%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF/id6746918468");
    }

    // Initial show delay
    const mountTimer = setTimeout(() => {
      setIsBannerMounted(true);
      // Small delay to allow unique render before applying transition class
      requestAnimationFrame(() => {
        setIsBannerVisible(true);
      });
    }, 4500);

    return () => clearTimeout(mountTimer);
  }, []);

  const handleCloseBanner = () => {
    setIsBannerVisible(false); // Trigger fade out / slide up
    setTimeout(() => {
      setIsBannerMounted(false); // Unmount after animation matches CSS duration
    }, 1500); 
  };

  // Auto-close banner after it becomes visible
  useEffect(() => {
    let autoCloseTimer;
    if (isBannerVisible) {
      autoCloseTimer = setTimeout(() => {
        handleCloseBanner();
      }, 7000);
    }
    return () => clearTimeout(autoCloseTimer);
  }, [isBannerVisible]);

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
      {isBannerMounted && (
        <div 
          className={`app-banner ${isBannerVisible ? 'visible' : ''}`}
          onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (touchStartY === null) return;
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - touchStartY;
            if (deltaY < 0) { // Only allow swiping up
              setSwipeOffset(deltaY);
            }
          }}
          onTouchEnd={() => {
            if (swipeOffset < -50) {
              handleCloseBanner();
            }
            setSwipeOffset(0);
            setTouchStartY(null);
          }}
          style={{
            transform: `translateY(${swipeOffset}px)`,
            transition: swipeOffset === 0 ? 'transform 0.4s ease-out, top 0.8s ease-in-out, opacity 0.8s ease-in-out' : 'none',
            ...(swipeOffset < 0 ? { cursor: 'grabbing' } : {}),
            touchAction: 'none'
          }}
        >
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
            <div className="header-actions">
              {isLoggedIn && (
                <div className="notification-icon" onClick={() => navigate("/notifications")}>
                  <IoNotificationsOutline />
                  <span className="notification-dot"></span>
                </div>
              )}
              <div className="menu-icon" onClick={() => setOpenMenu(true)}>
                <RiMenu3Line />
              </div>
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

      <div className={`side-menu ${openMenu ? "show" : ""}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="side-menu-header">
          <div className="close-btn" onClick={() => setOpenMenu(false)}>
            <RiCloseLine />
          </div>
          <img src={Logo} className='logo-menu' alt="Logo" />
        </div>
        <ul>
          {isLoggedIn ? (
            <>
              <li><Link to="/profile"><ImUser /> {t("profile")}</Link></li>
              <li><Link to="/notifications"><IoNotificationsOutline /> {t("notifications")}</Link></li>
              {/* <li><Link to="/request-product"><FaMobileAlt /> {t("auctions")}</Link></li> */}
              <li onClick={handleLogout}><FaRegUserCircle /> {t("logout")}</li>
            </>
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

         {/* Simple Stats Display: Bottom, No Text, Daily Right, Monthly Left */}
        <div className="sidebar-stats" style={{ 
            padding: '15px 20px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#435292',
            flexDirection:'row',
            marginTop: '140px',
            borderTop: '1px solid #eee',
            fontWeight: 'bold'
        }}>
           {/* Daily */}
           <div title={t('today')} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
             <span style={{ fontSize: '11px', opacity: 0.7 }}></span>
             {stats.daily?.[0]?.total_visits || 0}
           </div>

           {/* Monthly */}
           <div title={t('this_month')} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
             <span style={{ fontSize: '11px', opacity: 0.7 }}></span>
             {stats.monthly?.[0]?.total_visits || 0}
           </div>
        </div>
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
