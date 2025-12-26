import React, { createContext, useState, useEffect } from "react";
import { setLoadingRef } from "../Services/LoadingHelper";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    // تمرير setter عالميًا لـ Axios
    useEffect(() => {
        setLoadingRef(setLoading);
    }, []);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
