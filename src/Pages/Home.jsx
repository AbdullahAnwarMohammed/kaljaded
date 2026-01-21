import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider/ImageSlider';
import Search from '../components/Search/Search';
import Api from '../Services/Api'; // axios instance
import HomeSkeleton from "../components/HomeSkeleton";

// Lazy load non-critical components
const Category = lazy(() => import('../components/Category/Category'));
const CategorySection = lazy(() => import('../components/CategorySection/CategorySection'));
const Welcome = lazy(() => import('../components/Welcome/Welcome'));

const Home = () => {

    const navigate = useNavigate();

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const fetchHomeData = async () => {
            try {
                const res = await Api.get("/categories-with-products", { cache: true }); // endpoint يجلب categories مع products
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

    if (loading) {
        return (
            <>
                <Search />
                <ImageSlider />
                <HomeSkeleton />
            </>
        );
    }

    return (
        <>
            <Search />
            <ImageSlider />
            <Suspense fallback={<HomeSkeleton />}>
                <Category />
                
                {sections.map((section) => (
                    <CategorySection 
                        key={section.category.id} 
                        data={section} 
                        onViewAll={() => handleViewAll(section.category.slug)} 
                    />
                ))}

                <Welcome />
            </Suspense>
        </>
    );
};

export default Home;