import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../Services/Api';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { RiArrowRightLine, RiUserLine, RiPhoneLine, RiMapPin2Line, RiLogoutBoxRLine, RiCalendarLine, RiMailLine, RiShoppingCartLine, RiBuildingLine, RiHome4Line, RiRoadMapLine, RiLayoutGridLine, RiCompass3Line } from "react-icons/ri";
import { getCities, getAreas } from '../api/locationApi';
import { useCart } from "../context/CartContext";
import "./Profile.css";

const Profile = () => {
    const { t, i18n } = useTranslation();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        city: '',
        area: '',
        block: '',
        street: '',
        building: '',
        floor: '',
        apartment: '',
    });
    const [displayPhone, setDisplayPhone] = useState('');
    const [pendingPhone, setPendingPhone] = useState('');
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'address'

    useEffect(() => {
        fetchProfile();
        fetchCities();
    }, []);

    useEffect(() => {
        if (formData.city) {
            fetchAreas(formData.city);
        }
    }, [formData.city]);

    const fetchCities = async () => {
        try {
            const res = await getCities();
            if (res.data.success) setCities(res.data.data);
        } catch (err) {
            console.error("Cities fetch failed", err);
        }
    };

    const fetchAreas = async (cityId) => {
        try {
            const res = await getAreas(cityId);
            if (res.data.success) setAreas(res.data.data);
        } catch (err) {
            console.error("Areas fetch failed", err);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await Api.get('/profile');
            if (response.data.success) {
                const userData = response.data.data.user;
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    city: userData.city_id || '',
                    area: userData.area_id || '',
                    block: userData.block || '',
                    street: userData.street || '',
                    building: userData.building || '',
                    floor: userData.floor || '',
                    apartment: userData.apartment || '',
                });
                setDisplayPhone(userData.phone || '');
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            if (err.response?.status === 401) {
                navigate('/login-customer');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await Api.post('/profile/update', formData);
            if (response.data.success) {
                setUser(response.data.data.user);
                localStorage.setItem('customer', JSON.stringify(response.data.data.user));
                Swal.fire({
                    icon: 'success',
                    title: isRTL ? 'تم التحديث بنجاح' : 'Updated Successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: isRTL ? 'فشل التحديث' : 'Update Failed',
                text: err.response?.data?.message || ''
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer');
        navigate('/');
        window.location.reload();
    };

    const handleSendPhoneOtp = async () => {
        if (!pendingPhone || pendingPhone.length < 8) {
             Swal.fire({ icon: 'error', title: isRTL ? 'رقم هاتف غير صحيح' : 'Invalid phone number' });
             return;
        }

        setSendingOtp(true);
        try {
            const response = await Api.post('/profile/update-phone/send-otp', { phone: pendingPhone });
            if (response.data.success) {
                setShowOtpInput(true);
                Swal.fire({
                    icon: 'info',
                    title: isRTL ? 'كود التحقق' : 'Verification Code',
                    text: isRTL ? 'تم إرسال كود التحقق لرقمك الجديد' : 'A verification code has been sent to your new number',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: isRTL ? 'فشل الإرسال' : 'Failed to send', text: err.response?.data?.message || '' });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyPhoneOtp = async () => {
        const code = otp.join('');
        if (code.length < 4) return;

        setVerifyingOtp(true);
        try {
            const response = await Api.post('/profile/update-phone/verify-otp', { code });
            if (response.data.success) {
                const updatedUser = response.data.data.user;
                setUser(updatedUser);
                setDisplayPhone(updatedUser.phone);
                localStorage.setItem('customer', JSON.stringify(updatedUser));
                setIsEditingPhone(false);
                setShowOtpInput(false);
                setPendingPhone('');
                setOtp(['', '', '', '']);
                Swal.fire({
                    icon: 'success',
                    title: isRTL ? 'تم تحديث الرقم بنجاح' : 'Phone updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: isRTL ? 'كود خاطئ' : 'Invalid Code', text: err.response?.data?.message || '' });
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleOtpChange = (index, value) => {
        const val = value.replace(/\D/g, "").slice(0, 1);
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        if (val && index < 3) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    if (loading) return <div className="profile-loading"><div className="spinner"></div></div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-header-sticky">
                <div className="container header-content">
                    <RiArrowRightLine 
                        className={`back-btn ${isRTL ? '' : 'rotate-180'}`} 
                        onClick={() => navigate(-1)} 
                    />
                    <h1>{t('profile')}</h1>
                    <div className="header-actions">
                        <RiLogoutBoxRLine onClick={handleLogout} className="logout-icon-btn" />
                    </div>
                </div>
            </div>

            <div className="profile-content container">
                <div className="user-initials-card">
                    <div className="initials-circle">
                         {user?.name ? user.name.charAt(0).toUpperCase() : <RiUserLine />}
                    </div>
                    <div className="user-info-brief">
                        <h2>{user?.name || (isRTL ? 'مستخدم' : 'User')}</h2>
                        <p>{displayPhone}</p>
                    </div>
                </div>

                <div className="profile-tabs-nav">
                    <button 
                        className={`tab-item ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        {isRTL ? 'البيانات الشخصية' : 'Personal Info'}
                    </button>
                    <button 
                        className={`tab-item ${activeTab === 'address' ? 'active' : ''}`}
                        onClick={() => setActiveTab('address')}
                    >
                        {isRTL ? 'العنوان' : 'Address'}
                    </button>
                </div>

                <div className="profile-form-section">
                    <form onSubmit={handleUpdate}>
                        {activeTab === 'personal' ? (
                            <div className="tab-pane">
                                <div className="profile-field-group">
                                    <label><RiUserLine /> {t('username')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                                    />
                                </div>

                                <div className="profile-field-group">
                                    <label><RiMailLine /> {t('email')}</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder={isRTL ? "البريد الإلكتروني" : "Email Address"}
                                    />
                                </div>

                                <div className={`profile-field-group ${!isEditingPhone ? 'disabled' : ''}`}>
                                    <label>
                                        <RiPhoneLine /> {t('phone')}
                                        {!isEditingPhone && (
                                            <span 
                                                className="edit-phone-trigger" 
                                                onClick={() => {
                                                    setIsEditingPhone(true);
                                                    setPendingPhone(displayPhone);
                                                }}
                                            >
                                                {isRTL ? "تغيير" : "Change"}
                                            </span>
                                        )}
                                    </label>
                                    <div className="phone-input-row">
                                        <input 
                                            type="text" 
                                            value={isEditingPhone ? pendingPhone : displayPhone} 
                                            onChange={(e) => setPendingPhone(e.target.value)}
                                            disabled={!isEditingPhone || showOtpInput}
                                        />
                                        {isEditingPhone && !showOtpInput && (
                                            <button 
                                                type="button" 
                                                className="btn-send-otp"
                                                onClick={handleSendPhoneOtp}
                                                disabled={sendingOtp}
                                            >
                                                {sendingOtp ? '...' : (isRTL ? 'تأكيد' : 'Confirm')}
                                            </button>
                                        )}
                                    </div>
                                    {!isEditingPhone && <span>{isRTL ? "رقم الهاتف لا يمكن تعديله حالياً" : "Phone number cannot be changed currently"}</span>}
                                </div>

                                {showOtpInput && (
                                    <div className="profile-field-group otp-group">
                                        <label>{isRTL ? "أدخل كود التحقق" : "Enter Verification Code"}</label>
                                        <div className="otp-inputs-wrapper">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    className="profile-otp-input"
                                                />
                                            ))}
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-verify-phone"
                                            onClick={handleVerifyPhoneOtp}
                                            disabled={verifyingOtp}
                                        >
                                            {verifyingOtp ? '...' : (isRTL ? 'تحقق' : 'Verify')}
                                        </button>
                                        <span className="otp-cancel" onClick={() => {setShowOtpInput(false); setIsEditingPhone(false); setPendingPhone(''); setOtp(['','','','']);}}>
                                            {isRTL ? "إلغاء التغيير" : "Cancel Change"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="tab-pane">
                                <div className="profile-field-group">
                                    <label><RiCompass3Line /> {t('city')}</label>
                                    <select 
                                        value={formData.city} 
                                        onChange={(e) => setFormData({...formData, city: e.target.value, area: ''})}
                                        className="profile-select"
                                    >
                                        <option value="">{t('city')}</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {isRTL ? c.name_ar : c.name_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="profile-field-group">
                                    <label><RiCompass3Line /> {t('area')}</label>
                                    <select 
                                        value={formData.area} 
                                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                                        className="profile-select"
                                        disabled={!formData.city}
                                    >
                                        <option value="">{t('area')}</option>
                                        {areas.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {isRTL ? a.name_ar : a.name_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="profile-field-group">
                                    <label><RiLayoutGridLine /> {t('block_placeholder')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.block} 
                                        onChange={(e) => setFormData({...formData, block: e.target.value})}
                                        placeholder={t('block_placeholder')}
                                    />
                                </div>
                                <div className="profile-field-group">
                                    <label><RiRoadMapLine /> {t('street_placeholder')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.street} 
                                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                                        placeholder={t('street_placeholder')}
                                    />
                                </div>

                                <div className="profile-field-group">
                                    <label><RiBuildingLine /> {t('building_placeholder')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.building} 
                                        onChange={(e) => setFormData({...formData, building: e.target.value})}
                                        placeholder={t('building_placeholder')}
                                    />
                                </div>
                                <div className="profile-field-group">
                                    <label><RiHome4Line /> {t('apartment_placeholder')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.apartment} 
                                        onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                                        placeholder={t('apartment_placeholder')}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="save-profile-btn" disabled={updating}>
                            {updating ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ التغييرات" : "Save Changes")}
                        </button>
                    </form>
                </div>

                <div className="profile-quick-links">
                     <div className="quick-link-item" onClick={() => navigate('/carts')}>
                         <div className="icon-wrap"><RiShoppingCartLine /></div>
                         <div className="text-wrap">
                             <h3>{t('cart')}</h3>
                             <p>{isRTL ? `لديك ${cartCount} منتجات في السلة` : `You have ${cartCount} items in your cart`}</p>
                         </div>
                     </div>
                     <div className="quick-link-item" onClick={() => navigate('/request-product')}>
                         <div className="icon-wrap"><RiMapPin2Line /></div>
                         <div className="text-wrap">
                             <h3>{t('auctions')}</h3>
                             <p>{isRTL ? "إدارة طلبات المزايدة الخاصة بك" : "Manage your auction requests"}</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
