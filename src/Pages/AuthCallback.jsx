import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { mergeGuestCart } from '../api/cartApi';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchCart, setCart } = useCart();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userStr = params.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                
                localStorage.setItem('customer_token', token);
                localStorage.setItem('customer', JSON.stringify(user));

                const finalizeAuth = async () => {
                    try {
                        await mergeGuestCart();
                        setCart(null);
                        await fetchCart();
                    } catch (error) {
                        console.error("Cart merge error:", error);
                        await fetchCart();
                    }

                    if (!user.name || !user.phone) {
                        navigate("/complete-profile");
                    } else {
                        navigate("/");
                    }
                };

                finalizeAuth();
            } catch (err) {
                console.error("Auth callback error:", err);
                navigate("/login-customer?error=callback_failed");
            }
        } else {
            navigate("/login-customer?error=missing_params");
        }
    }, [location, navigate, fetchCart, setCart]);

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#435292',
            color: '#fff',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <h3>جاري تسجيل الدخول...</h3>
        </div>
    );
};

export default AuthCallback;
