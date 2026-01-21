import React from 'react';
import '../LazyImage/LazyImage.css'; // For skeleton-loader class
import './CategorySection.css'; // For product-card styles

const ProductCardSkeleton = () => {
    return (
        <div className="product-card">
            <div className="image" style={{ overflow: "hidden", position: "relative", backgroundColor: "#f0f0f0" }}>
                <div className="skeleton-loader" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
            </div>

            <div className="content">
                {/* Product Name Skeleton */}
                <div className="skeleton-loader" style={{ 
                    position: 'relative', 
                    width: '90%', 
                    height: '20px', 
                    margin: '10px auto 5px',
                    borderRadius: '4px' 
                }}></div>

                {/* Price/Info Skeleton */}
                <div className="info-two" style={{ marginTop: '15px' }}>
                    <div className="skeleton-loader" style={{ 
                        position: 'relative', 
                        width: '40%', 
                        height: '16px', 
                        borderRadius: '4px' 
                    }}></div>
                </div>

                {/* Button Skeleton */}
                <div className="skeleton-loader" style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '35px', 
                    marginTop: '15px',
                    borderRadius: '8px' 
                }}></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
