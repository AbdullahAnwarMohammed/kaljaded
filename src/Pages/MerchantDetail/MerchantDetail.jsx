import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./MerchantDetail.css";
import imagePlaceholder from "../../assets/merchmant.jpg";
import ProductCard from "../../components/CategorySection/ProductCard";
import Api from "../../Services/Api";
import { RiArrowRightLine, RiSearchLine } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { TbMoodEmpty } from "react-icons/tb";

// دالة بسيطة للـ debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const MerchantDetail = () => {
    const { id } = useParams();
    console.log(id);
    // بيانات التاجر
    const [merchant, setMerchant] = useState(null);

    // بيانات المنتجات
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 500); // تأخير 500ms قبل البحث

    useEffect(() => {
        const fetchMerchant = async () => {
            try {
                const res = await Api.get(`/merchants/${id}`);
                if (res.data.success) {
                    setMerchant(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching merchant:", err.response?.data || err.message);
            }
        };
        fetchMerchant();
    }, [id]);

    // جلب المنتجات عند تغير الصفحة أو البحث
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const params = { per_page: 12, page, q: debouncedSearch };
                const res = await Api.get(`/merchants/${id}/products`, { params });

                if (res.data.success) {
                    setProducts(res.data.data.data);
                    setMeta(res.data.data.meta);
                } else {
                    setProducts([]);
                    setMeta({});
                }
            } catch (err) {
                console.error("Error fetching products:", err.response?.data || err.message);
                setProducts([]);
                setMeta({});
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, [id, page, debouncedSearch]);


    if (!merchant) return <p>التاجر غير موجود</p>;

    return (
        <div className="merchant-details-page">
            <div className="top-header">
                <Link to="/merchants" className="icon-back">
                    <RiArrowRightLine />
                </Link>
                <h6>{merchant.name_vendor || merchant.name}</h6>
            </div>
            {/* ===== Header ===== */}
            <header className="merchant-header">
                <div className="merchant-image">
                    <img src={merchant.image_vendor || imagePlaceholder} alt={merchant.name} />
                </div>

                <div className="info">
                    <div className="left">

                        <a href={`tel:${merchant.phone_vendor || merchant.phone}`} className="phone-icon">
                            <FaPhoneAlt />
                        </a>

                        <a 
                            href={`https://wa.me/${merchant.phone_vendor || merchant.phone}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="whatsapp-icon"
                        >
                            <FaWhatsapp />
                        </a>
                    </div>

                    <div className="right">
                        <div className="icon">
                            <small>{merchant.rating ?? 0}</small><FaStar />
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Search ===== */}
            <div className="search-container" style={{ padding: "0 13px", marginTop: "15px" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث في منتجات التاجر..."
                        style={{
                            width: "100%",
                            padding: "12px 15px",
                            paddingRight: "40px", 
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                            outline: "none",
                            fontSize: "0.95rem"
                        }}
                    />
                    <RiSearchLine style={{
                        position: "absolute",
                        right: "12px",
                        color: "#888",
                        fontSize: "1.2rem"
                    }} />
                </div>
            </div>




            {/* ===== Products ===== */}
            <div className="merchant-products-section">
                <div className="products-row">
                    {loadingProducts ? (
                        <p>جاري تحميل المنتجات...</p>
                    ) : products.length > 0 ? (
                        <div className="products-grid">
                            {products.map((product) => <ProductCard key={product.id} p={product} showFastBadge={true} />)}
                        </div>
                    ) : (
                        <p className="empty-products">لا توجد منتجات لهذا التاجر  <TbMoodEmpty /></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MerchantDetail;
