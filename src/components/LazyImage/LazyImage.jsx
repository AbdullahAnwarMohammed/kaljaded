import React, { useState } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className, style, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`lazy-image-container ${className || ''}`} style={style} onClick={onClick}>
            {!isLoaded && <div className="skeleton-loader"></div>}
            <img
                src={src}
                alt={alt}
                className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
            />
        </div>
    );
};

export default LazyImage;
