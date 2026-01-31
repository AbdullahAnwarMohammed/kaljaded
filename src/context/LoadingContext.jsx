import React, { createContext, useState, useEffect } from "react";
import { setLoadingRef } from "../Services/LoadingHelper";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    // تمرير setter عالميًا لـ Axios
    useEffect(() => {
        setLoadingRef(setLoading);
    }, []);

    // Safety timeout: Never allow loading to stay true for more than 20 seconds
    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => {
                setLoading(false);
            }, 20000);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
