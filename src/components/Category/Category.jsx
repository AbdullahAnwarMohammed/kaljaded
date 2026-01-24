import React, { useEffect, useState } from 'react'
import './Category.css'
import { useNavigate } from 'react-router-dom';
import Api from "../../Services/Api"; // axios instance
import LazyImage from '../LazyImage/LazyImage';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await Api.get("/categories", { cache: true, skipLoader: true }); 
                if (res.data.success) {
                    setCategories(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleViewAll = (slug) => {
        navigate(`/category/${slug}`);
    }

    if (loading) {
        return (
            <div className="container">
                <div className="category-container" style={{ overflowX: 'hidden' }}>
                     <div style={{ display: 'flex', gap: '15px', paddingBottom: '20px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ minWidth: '80px', textAlign: 'center', position: 'relative' }}>
                                <div className="skeleton-loader" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '10px' }}></div>
                                <div className="skeleton-loader" style={{ width: '40px', height: '10px', margin: 'auto' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
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
                                priority={true}
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
