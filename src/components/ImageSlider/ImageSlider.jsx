import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Api from "../../Services/Api"; // axios instance
import LazyImage from "../LazyImage/LazyImage"; // Import LazyImage

import "./ImageSlider.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const ImageSlider = () => {
    const [banners, setBanners] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await Api.get("/banners", { cache: true });
                if (res.data.success) {
                    setBanners(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch banners:", err);
            }
        };
        fetchBanners();
    }, []);

    const openPopup = (item) => {
        setPopupContent(item);
        setShowPopup(true);
    };
    const closePopup = () => setShowPopup(false);
    const settings = {
        infinite: true,
        speed: 1100,          // وقت الانتقال
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3500,  // وقت العرض
        cssEase: "cubic-bezier(0.77, 0, 0.175, 1)",
    };


    return (
        <>
            <div className="image-slider" style={{ width: "100%", margin: "auto" }}>
                <Slider {...settings}>
                    {banners.map((item, index) => (
                        <div key={item.id} className="app-image-slider" style={{ position: "relative" }}>
                            <LazyImage
                                src={item.image}
                                alt={item.title}
                                className="slider-image" // Add a class for specific slider styling if needed
                                style={{ width: '100%', height: '100%' }}
                            />
                            <div
                            >
                                <button className="button" onClick={() => openPopup(item)}>
                                    عرض المزيد
                                </button>
                            </div>
                        </div>
                    ))}
                </Slider>
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
