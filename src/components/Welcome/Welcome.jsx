import React, { useEffect, useState } from 'react'
import { FaTiktok } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io";
import { AiOutlineLike } from "react-icons/ai";
import { SiWhatsapp } from "react-icons/si";
import { useTranslation } from "react-i18next";

import "./Welcome.css";
import Api from '../../Services/Api';
const Welcome = () => {
    const { t } = useTranslation();
    const [socials, setSocials] = useState({ whatsapp: "", tiktok: "", instgram: "" })
    useEffect(() => {
        Api.get("/settings").then(res => {
            if (res.data?.data) {
                setSocials({
                    whatsapp: res.data.data.whatsapp || "",
                    tiktok: res.data.data.tiktok || "",
                    instgram: res.data.data.instgram || ""
                });
            }
        }).catch(err => console.error(err));
    }, []);
    return (
        <div className="component-welcome">
            <div className="container">
                <h4>
                    {t("welcome_message")} <AiOutlineLike /> 
                      <a href="https://wa.me/96567691171" target="_blank" rel="noopener noreferrer">
                        <SiWhatsapp />
                    </a>
                </h4>
                <p>{t("social_accounts")}</p>

                <div className='social'>
                    {socials.instgram && (
                        <a href={socials.instgram} target="_blank" rel="noopener noreferrer">
                            <IoLogoInstagram />
                        </a>
                    )}
                    {socials.tiktok && (
                        <a href={socials.tiktok} target="_blank" rel="noopener noreferrer">
                            <FaTiktok />
                        </a>
                    )}

                    {/* {socials.whatsapp && (
                        <a href={`https://wa.me/${socials.whatsapp.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                            <SiWhatsapp />
                        </a>
                    )} */}
                </div>
            </div>
        </div>
    )
}

export default Welcome