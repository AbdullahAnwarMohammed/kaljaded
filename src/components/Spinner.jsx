import { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";

const Spinner = () => {
    const { loading } = useContext(LoadingContext);

    if (!loading) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            display: "flex", justifyContent: "center", alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 9999
        }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Spinner;
