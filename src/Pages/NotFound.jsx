import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdOutlineErrorOutline } from 'react-icons/md';
import './NotFound.css';

const NotFound = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-icon">
                    <MdOutlineErrorOutline size={100} color="#2d2e83" />
                </div>
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">{t('page_not_found') || 'الصفحة غير موجودة'}</h2>
                <p className="not-found-text">
                    {t('not_found_desc') || 'عذراً، الصفحة التي تبحث عنها غير متوفرة حالياً أو تم نقلها.'}
                </p>
                <button 
                    className="not-found-btn"
                    onClick={() => navigate('/')}
                >
                    {t('back_home') || 'العودة للرئيسية'}
                </button>
            </div>
            
            <div className="not-found-decor">
                <div className="decor-circle circle-1"></div>
                <div className="decor-circle circle-2"></div>
                <div className="decor-circle circle-3"></div>
            </div>
        </div>
    );
};

export default NotFound;
