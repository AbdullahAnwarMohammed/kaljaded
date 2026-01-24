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

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const fetchHomeData = async () => {
            try {
                const res = await Api.get("/categories-with-products", { cache: true, skipLoader: true });
                if (res.data.success) {
                    setSections(res.data.data);
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