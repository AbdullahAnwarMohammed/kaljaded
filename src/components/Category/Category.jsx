import React, { useEffect, useState } from 'react'
import './Category.css'
import { useNavigate } from 'react-router-dom';
import Api from "../../Services/Api"; // axios instance
import LazyImage from '../LazyImage/LazyImage';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await Api.get("/categories", { cache: true }); 
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
                            <LazyImage 
                                src={cat.image} 
                                alt={cat.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <p>{cat.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )

}

export default React.memo(Category);
