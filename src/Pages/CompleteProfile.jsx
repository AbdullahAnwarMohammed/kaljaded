import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../Services/Api';
// import { useTranslation } from 'react-i18next'; // Not needed if hardcoding
import Swal from 'sweetalert2';
import Logo from "../assets/logo.png";
import { RiArrowRightLine } from "react-icons/ri";
import "./LoginCustomer.css"; // Reuse login styles for consistency

const CompleteProfile = () => {
    const navigate = useNavigate();
    // const { t } = useTranslation();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem('customer') || '{}');
        if (user.name) setName(user.name);
        if (user.phone) setPhone(user.phone);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer');
        navigate('/login-customer');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('الاسم مطلوب');
            return;
        }

        if (!phone.trim()) {
            setError('رقم الهاتف مطلوب');
            return;
        }

        // Simple frontend validation for Kuwait phone
        const kuwaitRegex = /^(965)?(\d{8})$/;
        if (!kuwaitRegex.test(phone.replace(/[\s+]/g, ''))) {
            setError('الرجاء إدخال رقم هاتف كويتي صحيح (8 أرقام)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await Api.post('/profile/update', { 
                name,
                phone: phone.replace(/[\s+]/g, '') 
            });
            
            // Update local storage with new user data
            const user = JSON.parse(localStorage.getItem('customer') || '{}');
            user.name = name;
            user.phone = response.data.data.user.phone; // Use the standardized phone from backend
            localStorage.setItem('customer', JSON.stringify(user));

            Swal.fire({
                icon: 'success',
                title: 'تم الحفظ بنجاح',
                timer: 1500,
                showConfirmButton: false
            });

            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'فشل تحديث الملف الشخصي');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-customer-page">
            <RiArrowRightLine 
                className="icon-back" 
                onClick={handleLogout} 
                style={{ cursor: 'pointer' }} 
            />
            <img src={Logo} className='logo' alt="Logo" />
            <div className="app-login">
                <h3>تسجيل بياناتك</h3>
                <p style={{color: 'rgb(255, 255, 255)',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginTop: '13px'}}>
                    يرجى إكمال بياناتك للاستمرار
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder='الاسم الكامل'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder='رقم الهاتف (المنطقة 965)'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        {error && <div className="error-msg">{error}</div>}
                    </div>

                    <div className="form-group">
                        <button type="submit" disabled={loading}>
                            {loading ? 'جار الحفظ...' : 'حفظ ومتابعة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
