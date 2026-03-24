import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EnrollmentCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('customer_token');
        if (token) {
            try {
                const customer = JSON.parse(localStorage.getItem('customer') || '{}');
                // Prevent infinite loop by checking if we are already on the page
                if (!customer.name && location.pathname !== '/complete-profile') {
                    // Allow logout if on complete-profile page (handled by component itself)
                    // But if user tries to go elsewhere, redirect back.
                    navigate('/complete-profile', { replace: true });
                }
            } catch (e) {
                console.error("Error checking enrollment", e);
            }
        }
    }, [location, navigate]);

    return null;
};

export default EnrollmentCheck;
