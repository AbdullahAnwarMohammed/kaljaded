import React, { useEffect, useState } from 'react'
import './Category.css'
import { useNavigate } from 'react-router-dom';


import Api from "../../Services/Api"; // axios instance



const Category = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await Api.get("/categories"); 
                console.log(res);
                if (res.data.success) {
                    setCategories(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleViewAll = (slug) => {
        navigate(`/category/${slug}`);
    }
    return (
        <div className="container">
            <div className="category-container">
                {categories.map(cat => (
                    <div
                        onClick={() => handleViewAll(cat.slug)}
                        className="category-item"
                        key={cat.id}
                    >
                        <div className="image">
                            <img src={cat.image} alt={cat.name} />
                        </div>
                        <p>{cat.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )

}

export default Category
