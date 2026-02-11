import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider/ImageSlider';
import Search from '../components/Search/Search';
import Api from '../Services/Api'; // axios instance
import HomeSkeleton from "../components/HomeSkeleton";

// Static imports for immediate loading
import Category from '../components/Category/Category';
import CategorySection from '../components/CategorySection/CategorySection';
import Welcome from '../components/Welcome/Welcome';

const Home = () => {

    const navigate = useNavigate();

    const [sections, setSections] = useState(() => {
        const saved = localStorage.getItem("home_sections");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Strip views from cached data to ensure we don't show stale numbers
                parsed.forEach(section => {
                    if (section.products) {
                        section.products.forEach(p => p.views = null); // or undefined
                    }
                });
                return parsed;
            } catch (e) {
                console.error("Cache parse error", e);
                return [];
            }
        }
        return [];
    });
    const [loading, setLoading] = useState(sections.length === 0);

    // useEffect(() => {
    //     const hasSeenPopup = sessionStorage.getItem("popupSeen");
    //     if (!hasSeenPopup) {
    //         setShowPopup(true);
    //         sessionStorage.setItem("popupSeen", "true");
    //     }
    // }, []);

    useEffect(() => {
        // Record site visit
        const recordVisit = async () => {
            try {
                await Api.post("/site-visit", {}, { skipLoader: true });
            } catch (error) {
                console.error("Failed to record visit:", error);
            }
        };
        recordVisit();
        
        const fetchHomeData = async () => {
            try {
                // Removed cache: true to ensure fresh data
                const res = await Api.get("/categories-with-products", { skipLoader: true });
                if (res.data.success) {
                    setSections(res.data.data);
                    localStorage.setItem("home_sections", JSON.stringify(res.data.data));
                }
            } catch (err) {
                console.error("Failed to fetch home data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);


    const handleViewAll = (slug) => {
        navigate(`/category/${slug}`);
    };

    return (
        <>
            <Search />
            <ImageSlider />
            {/* Suspense removed for eager loading */}
            <Category />
            
            {loading ? (
                <HomeSkeleton showCategories={false} /> 
            ) : (
                sections.map((section) => (
                    <CategorySection 
                        key={section.category.id} 
                        data={section} 
                        onViewAll={() => handleViewAll(section.category.slug)} 
                    />
                ))
            )}

            <Welcome />
        </>
    );
};

export default Home;