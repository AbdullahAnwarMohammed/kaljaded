import React from 'react'
import "./ContactUs.css";
import { Link } from "react-router-dom";
import { RiArrowRightLine, RiInstagramFill, RiTiktokFill, RiAppleFill, RiGooglePlayFill, RiWhatsappFill } from "react-icons/ri";
import image from "../assets/banner.png";
import { useTranslation } from "react-i18next";

const ContactUs = () => {
    const { t } = useTranslation();

    return (
        <div className="contact-us-page">
            <header>
                <Link to="/" className='icon-back'>
                    <RiArrowRightLine />
                </Link>
                <h6>{t("contact_us")}</h6>
            </header>

            <div className="banner">
                <img src={image} alt="" />
                <div className="content">
                    <h2>{t("installments_banner")}</h2>
                    <button>{t("collaboration_btn")}</button>
                </div>
            </div>

            <div className="social">

                <a className="social-box instagram" href="#">
                    <RiArrowRightLine className="arrow" />
                    <span>{t("follow_instagram")}</span>
                    <i className="icon"><RiInstagramFill /></i>
                </a>

                <a className="social-box tiktok" href="#">
                    <RiArrowRightLine className="arrow" />
                    <span>{t("follow_tiktok")}</span>
                    <i className="icon"><RiTiktokFill /></i>
                </a>

                <a className="social-box appstore" href="#">
                    <RiArrowRightLine className="arrow" />
                    <span>{t("download_app")}</span>
                    <RiAppleFill className="icon" />
                </a>

                <a className="social-box playstore" href="#">
                    <RiArrowRightLine className="arrow" />
                    <span>{t("download_app")}</span>
                    <RiGooglePlayFill className="icon" />
                </a>

                <a className="social-box whatsapp" href="#">
                    <RiArrowRightLine className="arrow" />
                    <span>{t("ask_question")}</span>
                    <RiWhatsappFill className="icon" />
                </a>

            </div>

            <div className="footer">
                <h6>{t("business_license")}</h6>
                <h6>{t("all_rights_reserved")}</h6>
                <h6>{t("country")}</h6>
                <h6>{t("version")}</h6>
            </div>
        </div>
    )
}

export default ContactUs