import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

import Api from "../../Services/Api"; // axios instance
import LazyImage from "../LazyImage/LazyImage"; // Import LazyImage

import "./ImageSlider.css";

const ImageSlider = () => {
    const [banners, setBanners] = useState(() => {
        const saved = localStorage.getItem("home_banners");
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(banners.length === 0);
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await Api.get("/banners", { cache: true, skipLoader: true });
                if (res.data.success) {
                    setBanners(res.data.data);
                    localStorage.setItem("home_banners", JSON.stringify(res.data.data));
                }
            } catch (err) {
                console.error("Failed to fetch banners:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (loading) {
        return (
            <div className="image-slider">
                 <div className="skeleton-banner"></div>
            </div>
        );
    }

    const openPopup = (item) => {
        setPopupContent(item);
        setShowPopup(true);
    };
    const closePopup = () => setShowPopup(false);

    return (
        <>
            <div className="image-slider" style={{ width: "100%", margin: "auto" }}>
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    speed={1100}
                    className="mySwiper"
                >
                    {banners.map((item, index) => (
                        <SwiperSlide key={item.id}>
                            <div className="app-image-slider" style={{ position: "relative" }}>
                                <LazyImage
                                    src={item.image}
                                    alt={item.title}
                                    className="slider-image" // Add a class for specific slider styling if needed
                                    style={{ width: '100%', height: '100%' }}
                                    priority={index === 0}
                                />
                                <div>
                                    <button className="button" onClick={() => openPopup(item)}>
                                        عرض المزيد
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {showPopup && (
                <div onClick={closePopup} className="AppPopupSliderImage">
                    <div onClick={(e) => e.stopPropagation()} className="ItemPopupSliderImage">
                        <button onClick={closePopup} className="ClosePopupSliderImage">✖</button>
                        <h2>{popupContent?.title}</h2>
                        <p>{popupContent?.description}</p>
                        {popupContent?.body && popupContent.body !== "" && (
                            <ol>
                                {JSON.parse(popupContent.body).map((b, i) => (
                                    <li key={i}>{b}</li>
                                ))}
                            </ol>
                        )}

                    </div>
                </div>
            )}
        </>
    );
};

export default React.memo(ImageSlider);
