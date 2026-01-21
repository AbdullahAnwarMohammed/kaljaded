import { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";
import "./Spinner.css";

const Spinner = () => {
    const { loading } = useContext(LoadingContext);

    if (!loading) return null;

    return (
        <div className="spinner-overlay">
            <div className="spinner-container">
                <div className="modern-spinner"></div>
                {/* Optional: Add text/logo if desired */}
                {/* <div className="loading-text">Loading...</div> */}
            </div>
        </div>
    );
};

export default Spinner;
