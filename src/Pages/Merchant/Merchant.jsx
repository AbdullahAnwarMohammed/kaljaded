import { useEffect, useState } from "react";
import "./Merhant.css";
import imgPlaceholder from "../../assets/merchmant.jpg";
import { Link, useNavigate } from "react-router-dom";
import Api from "../../Services/Api";
import { RiSearchLine, RiArrowRightLine, RiStore3Line } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import MerchantCardSkeleton from "./MerchantCardSkeleton"; // Import Skeleton

// Hook Debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const Merchant = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [merchants, setMerchants] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Search State
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const [cities, setCities] = useState(() => {
        const saved = localStorage.getItem("site_cities");
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedCity, setSelectedCity] = useState(null);

    // Fetch Cities
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await Api.get('/cities', { cache: true, skipLoader: true });
                if(res.data.success) {
                    setCities(res.data.data);
                    localStorage.setItem("site_cities", JSON.stringify(res.data.data));
                }
            } catch (err) {
                console.error("Error fetching cities:", err);
            }
        };
        fetchCities();
    }, []);

    const fetchMerchants = async (pageNumber, searchQuery, reset = false) => {
        // If we are loading and it's not a reset (new search), prevent duplicate
        if (loading && !reset) return;
        // If no more data and it's not a reset, stop
        if (!hasMore && !reset) return;

        try {
            setLoading(true);

            // Params
            const params = { page: pageNumber };
            if (searchQuery) params.search = searchQuery;
            if (selectedCity) params.city_id = selectedCity;

            // Use the API cache for all requests in this page
            const res = await Api.get("/merchants", { 
                params, 
                skipLoader: true, // We handle loading locally for better control
                cache: true // Cache everything (cities, search) for smooth tab switching
            });

            if (res.data.success) {
                const newMerchants = res.data.data.data;
                const metaData = res.data.data.meta;

                setMerchants(prev => {
                    if (reset) return newMerchants;
                    
                    const uniqueNewMerchants = newMerchants.filter(
                        nm => !prev.some(pm => pm.id === nm.id)
                    );
                    return [...prev, ...uniqueNewMerchants];
                });
                
                setMeta(metaData);

                if (metaData.current_page >= metaData.last_page) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (error) {
            console.error("Error fetching merchants:", error);
        } finally {
            setLoading(false);
        }
    };

    // When search or city changes, reset and fetch
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchMerchants(1, debouncedSearch, true);
    }, [debouncedSearch, selectedCity]);


    // Infinite Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
                hasMore &&
                !loading
            ) {
                setPage(prev => prev + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading]);

    // Load next page
    useEffect(() => {
        if (page > 1) {
            fetchMerchants(page, debouncedSearch, false);
        }
    }, [page]);

    return (
        <div className="merchant-page">
            
            {/* Header like Product Details */}
            <header className="merchant-header-page">
                <div onClick={() => navigate(-1)} className="icon-back">
                    <RiArrowRightLine />
                </div>
                <h6>{t("merchants", "المتاجر")}</h6>
            </header>

            <div className="merchant-page-app">
                
                {/* Cities Tabs */}
                <div className="merchant-cities-tabs">
                    <div 
                        className={`city-tab ${selectedCity === null ? 'active' : ''}`}
                        onClick={() => setSelectedCity(null)}
                    >
                        {t("all", "الكل")}
                    </div>
                    {cities.map(city => (
                        <div 
                            key={city.id}
                            className={`city-tab ${selectedCity === city.id ? 'active' : ''}`}
                            onClick={() => setSelectedCity(city.id)}
                        >
                            {i18n.language === 'en' ? city.name_en : city.name_ar}
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="search-container-merchant">
                    <input 
                        type="text" 
                        placeholder={t("search_merchant", "ابحث عن اسم المتجر...")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <RiSearchLine className="search-icon" />
                </div>

                <div className="items">
                    {merchants.length > 0 && merchants.map((merchant) => (
                        <div className="item" key={merchant.id}>
                            <Link to={`/merchants/${merchant.id}`} state={{ merchant }} className="image">
                                <img
                                    src={merchant.image_vendor || imgPlaceholder}
                                    alt={merchant.name}
                                />
                            </Link>
                            <Link to={`/merchants/${merchant.id}`} state={{ merchant }}>
                                {merchant.name_vendor || merchant.name}
                            </Link>
                        </div>
                    ))}

                    {/* Show Skeletons when loading */}
                    {loading && Array.from({ length: 4 }).map((_, idx) => (
                        <MerchantCardSkeleton key={`skeleton-${idx}`} />
                    ))}

                    {/* Only show "No merchants" if NOT loading and list is empty */}
                    {!loading && merchants.length === 0 && (
                        <div className="no-merchants-found">
                            <div className="icon-wrapper">
                                <RiStore3Line />
                            </div>
                            <h3>{t("no_merchants_found", "لا يوجد تجار")}</h3>
                            <p>{t("try_another_search", "لم نعثر على أي متاجر تطابق بحثك الحالي، جرب تغيير المدينة أو كلمات البحث.")}</p>
                        </div>
                    )}
                </div>

                {!loading && !hasMore && merchants.length > 0 && (
                    <p style={{ textAlign: "center", marginTop: "15px" }}>
                        لا يوجد المزيد من التجار
                    </p>
                )}
            </div>
        </div>
    );
};

export default Merchant;
