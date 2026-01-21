import React from 'react';
import './LazyImage/LazyImage.css'; // Ensure skeleton styles are available

const HomeSkeleton = () => {
    // 60px height for category items
    // 200px for sections
    return (
        <div className="container" style={{ padding: '20px 0' }}>
            {/* Category Skeleton */}
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ minWidth: '80px', textAlign: 'center' }}>
                        <div className="skeleton-loader" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '10px' }}></div>
                        <div className="skeleton-loader" style={{ width: '40px', height: '10px', margin: 'auto' }}></div>
                    </div>
                ))}
            </div>

            {/* Section Skeleton */}
            {[1, 2].map(s => (
                <div key={s} style={{ marginTop: '30px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div className="skeleton-loader" style={{ width: '120px', height: '24px' }}></div>
                        <div className="skeleton-loader" style={{ width: '60px', height: '24px' }}></div>
                     </div>
                     <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
                        {[1, 2, 3].map(p => (
                            <div key={p} style={{ minWidth: '160px' }}>
                                <div className="skeleton-loader" style={{ width: '100%', height: '180px', borderRadius: '10px' }}></div>
                                <div className="skeleton-loader" style={{ width: '80%', height: '14px', marginTop: '10px' }}></div>
                                <div className="skeleton-loader" style={{ width: '50%', height: '14px', marginTop: '5px' }}></div>
                            </div>
                        ))}
                     </div>
                </div>
            ))}
        </div>
    );
};

export default HomeSkeleton;
