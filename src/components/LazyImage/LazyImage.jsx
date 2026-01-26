import React, { useState } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className, style, onClick, priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(priority);

    return (
        <div className={`lazy-image-container ${className || ''}`} style={style} onClick={onClick}>
            {(!isLoaded && !priority) && <div className="skeleton-loader"></div>}
            <img
                src={src}
                alt={alt}
                className={`lazy-image ${isLoaded || priority ? 'loaded' : ''}`}
                onLoad={() => setIsLoaded(true)}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                style={priority ? { opacity: 1, transition: 'none' } : {}}
                decoding="async"
            />
        </div>
    );
};

export default LazyImage;
