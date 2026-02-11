import React from 'react';
import './EmptyStateAnimation.css';

const EmptyStateAnimation = () => {
    return (
        <div className="empty-state-svg-container">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Floating Elements */}
                <circle cx="40" cy="50" r="4" fill="#a0a4b8" className="float-particle p1" />
                <circle cx="160" cy="30" r="6" fill="#a0a4b8" className="float-particle p2" />
                <circle cx="170" cy="140" r="3" fill="#a0a4b8" className="float-particle p3" />
                <circle cx="30" cy="120" r="5" fill="#a0a4b8" className="float-particle p4" />

                {/* Box Base */}
                <g className="box-animation">
                    <path d="M60 110 L100 130 L140 110 L100 90 L60 110" fill="#e0e2e8" stroke="#435292" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M60 110 V150 L100 170 V130 L60 110" fill="#d1d4dc" stroke="#435292" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M140 110 V150 L100 170 V130 L140 110" fill="#c2c5d1" stroke="#435292" strokeWidth="2" strokeLinejoin="round"/>
                    
                    {/* Open Flaps */}
                    <path d="M60 110 L50 80 L100 90 L60 110" fill="#e0e2e8" stroke="#435292" strokeWidth="2" strokeLinejoin="round" className="flap-left"/>
                    <path d="M140 110 L150 80 L100 90 L140 110" fill="#e0e2e8" stroke="#435292" strokeWidth="2" strokeLinejoin="round" className="flap-right"/>
                    
                    {/* Shadow */}
                    <ellipse cx="100" cy="185" rx="50" ry="10" fill="#000000" fillOpacity="0.1" className="shadow-pulse"/>
                </g>
            </svg>
        </div>
    );
};

export default EmptyStateAnimation;
