import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoArrowBack, IoGiftOutline, IoShieldCheckmarkOutline, IoNotificationsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { BiTimeFive } from 'react-icons/bi';
import Api from '../Services/Api';
import './Notifications.css';

const Notifications = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await Api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data.data);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notif) => {
        // Mark as read in background
        if (!notif.read_at) {
            Api.post(`/notifications/${notif.id}/mark-as-read`).catch(err => console.error(err));
            // Update local state for immediate feedback
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
        }

        // Navigate based on type
        if (notif.type === 'system' && notif.data?.action === 'rate_seller' && notif.data?.merchant_id) {
            navigate(`/merchants/${notif.data.merchant_id}`, { state: { activeTab: 'reviews' } });
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'welcome': return <IoNotificationsOutline />;
            case 'promo': return <IoGiftOutline />;
            case 'system': return <IoShieldCheckmarkOutline />;
            default: return <IoNotificationsOutline />;
        }
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return i18n.language === 'ar' ? 'الآن' : 'just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return i18n.language === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return i18n.language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return i18n.language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
        
        return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
    };

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div className="back-btn" onClick={() => navigate(-1)}>
                    <IoArrowBack />
                </div>
                <h3>إشعاراتي</h3>
            </div>
            
            <div className="notifications-list">
                {loading ? (
                    <div className="no-notifications">
                        <p>{t('loading') || 'جاري التحميل...'}</p>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-item ${notification.read_at ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className={`notif-icon-wrapper ${notification.type}`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <h4>{i18n.language === 'en' && notification.title_en ? notification.title_en : notification.title}</h4>
                                <p>{i18n.language === 'en' && notification.message_en ? notification.message_en : notification.message}</p>
                                <div className="notification-footer">
                                    <span className="notification-time">
                                        <BiTimeFive /> {getTimeAgo(notification.created_at)}
                                    </span>
                                    {notification.data?.merchant_name && (
                                        <span className="merchant-name-badge">
                                            {notification.data.merchant_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!notification.read_at && <div className="unread-indicator"></div>}
                        </div>
                    ))
                ) : (
                    <div className="no-notifications">
                        <div className="no-notifications-card">
                            <div className="no-notifications-icon-wrapper">
                                <IoNotificationsOutline />
                            </div>
                            <h3>{t('notifications_no_title')}</h3>
                            <p>{t('notifications_no_desc')}</p>
                            <button className="back-home-btn" onClick={() => navigate('/')}>
                                {t('back_to_home')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
