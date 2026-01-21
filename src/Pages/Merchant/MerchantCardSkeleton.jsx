import React from 'react';
import '../../components/LazyImage/LazyImage.css'; // For skeleton-loader class
import './Merhant.css'; // For item styles

const MerchantCardSkeleton = () => {
    return (
        <div className="item" style={{ pointerEvents: 'none' }}>
            <div className="image" style={{ overflow: "hidden", position: "relative", backgroundColor: "#fff" }}>
                <div className="skeleton-loader" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
            </div>
            <div style={{ padding: '0 10px 10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className="skeleton-loader" style={{ 
                    position: 'relative', 
                    width: '70%', 
                    height: '16px', 
                    borderRadius: '4px',
                    margin: '5px auto'
                }}></div>
            </div>
        </div>
    );
};

export default MerchantCardSkeleton;
