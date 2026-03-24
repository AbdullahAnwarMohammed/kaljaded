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

import { useTranslation } from "react-i18next";

const Home = () => {
    const { t } = useTranslation();
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
    const [latestProducts, setLatestProducts] = useState(() => {
        const saved = localStorage.getItem("latest_products");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [latestSales, setLatestSales] = useState(() => {
        const saved = localStorage.getItem("latest_sales_cache");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const [loading, setLoading] = useState(sections.length === 0 && latestProducts.length === 0 && latestSales.length === 0);

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
                // Fetch categories with products
                const res = await Api.get("/categories-with-products", { skipLoader: true });
                if (res.data.success) {
                    setSections(res.data.data);
                    localStorage.setItem("home_sections", JSON.stringify(res.data.data));
                }

                // Fetch latest products
                const latestRes = await Api.get("/products/latest", { skipLoader: true });
                if (latestRes.data.success) {
                    const data = latestRes.data.data;
                    // Support both simple array and paginated object { products: { data: [] } } or { products: [] }
                    const productsArray = Array.isArray(data) 
                        ? data 
                        : (data.products?.data || data.products || []);
                    
                    setLatestProducts(productsArray);
                    localStorage.setItem("latest_products", JSON.stringify(productsArray));
                }

                // Fetch latest sales
                const salesRes = await Api.get("/orders/latest", { skipLoader: true });
                if (salesRes.data.success) {
                    setLatestSales(salesRes.data.data);
                    localStorage.setItem("latest_sales_cache", JSON.stringify(salesRes.data.data));
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
                <>
                    {latestProducts.length > 0 && (
                        <CategorySection 
                            data={{
                                category: { name: t("latest_available"), slug: "all" },
                                products: latestProducts
                            }} 
                            onViewAll={() => navigate('/category/all')} 
                        />
                    )}

                    {sections.map((section) => (
                        <CategorySection 
                            key={section.category.id} 
                            data={section} 
                            onViewAll={() => handleViewAll(section.category.slug)} 
                        />
                    ))
                    }

                    {latestSales.length > 0 && (
                        <CategorySection 
                            isSold={true}
                            data={{
                                category: { name: t("latest_sales"), slug: "all" },
                                products: latestSales
                            }} 
                        />
                    )}
                </>
            )}

            <Welcome />
        </>
    );
};

export default Home;