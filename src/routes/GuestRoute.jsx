import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
    const token = localStorage.getItem("customer_token");

    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default GuestRoute;
