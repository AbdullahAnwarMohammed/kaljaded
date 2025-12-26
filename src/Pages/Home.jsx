import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider/ImageSlider';
import Category from '../components/Category/Category';
import CategorySection from '../components/CategorySection/CategorySection';
import Welcome from '../components/Welcome/Welcome';
import Search from '../components/Search/Search';

import Api from '../Services/Api'; // axios instance

const Home = () => {

    const navigate = useNavigate();

    const [sections, setSections] = useState([]);

    useEffect(() => {
        
        const fetchHomeData = async () => {
            try {
                const res = await Api.get("/categories-with-products"); // endpoint يجلب categories مع products
                if (res.data.success) {
                    setSections(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch home data:", err);
            }
        };
        fetchHomeData();
    }, []);


    const handleViewAll = (title) => {
        navigate(`/category/${title}`);
    };

    return (
        <>
            <Search />
            <ImageSlider />
            <Category />
            {sections.map(section => (
                <CategorySection
                    key={section.category.id}
                    data={section}  
                    onViewAll={() => handleViewAll(section.category.slug)}
                />
            ))}
            <Welcome />
        </>
    );
};

export default Home;