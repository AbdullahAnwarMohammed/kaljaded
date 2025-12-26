import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MerchantDetail.css";
import imagePlaceholder from "../../assets/merchmant.jpg";
import ProductCard from "../../components/CategorySection/ProductCard";
import Api from "../../Services/Api";

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
    const { slug } = useParams();

    // بيانات التاجر
    const [merchant, setMerchant] = useState(null);

    // بيانات المنتجات
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 500); // تأخير 500ms قبل البحث

    // جلب بيانات التاجر مرة واحدة عند تغير slug
    useEffect(() => {
        const fetchMerchant = async () => {
            try {
                const res = await Api.get(`/user/merchants/${slug}`);
                if (res.data.success) {
                    setMerchant(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching merchant:", err.response?.data || err.message);
            }
        };
        fetchMerchant();
    }, [slug]);

    // جلب المنتجات عند تغير الصفحة أو البحث
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const params = { per_page: 12, page, q: debouncedSearch };
                const res = await Api.get(`/user/merchants/${slug}/products`, { params });

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
    }, [slug, page, debouncedSearch]);


    if (!merchant) return <p>التاجر غير موجود</p>;

    return (
        <div className="merchant-details-page">
            {/* ===== Header ===== */}
            <header className="merchant-header">
                <div className="merchant-image">
                    <img src={merchant.image_vendor || imagePlaceholder} alt={merchant.name} />
                </div>
                <div className="merchant-info">
                    <h4 className="merchant-name">{merchant.name_vendor || merchant.name}</h4>
                    <div className="merchant-meta">
                        <div className="meta-item">
                            <span className="meta-label">عدد المنتجات:</span>
                            <span className="meta-value">{meta.total || 0}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">رقم الهاتف:</span>
                            <span className="meta-value">{merchant.phone_vendor || merchant.phone}</span>
                        </div>
                        {merchant.address && (
                            <div className="meta-item">
                                <span className="meta-label">العنوان:</span>
                                <span className="meta-value">{merchant.address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ===== Search ===== */}
            <div className="merchant-search my-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="ابحث عن منتج..."
                    value={search}
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                />
            </div>

            {/* ===== Products ===== */}
            <div className="merchant-products-section">
                <div className="products-row">
                    {loadingProducts ? (
                        <p>جاري تحميل المنتجات...</p>
                    ) : products.length > 0 ? (
                        products.map((product) => <ProductCard key={product.id} p={product} />)
                    ) : (
                        <p>لا توجد منتجات لهذا التاجر</p>
                    )}
                </div>

                {/* ===== Pagination ===== */}
                {meta.total > 0 && !loadingProducts && (
                    <div className="pagination my-3">
                        {meta.prev_page_url && (
                            <button className="btn btn-dark rounded-0 me-2" onClick={() => setPage(page - 1)}>
                                السابق
                            </button>
                        )}
                        <span>
                            صفحة {meta.current_page} من {meta.last_page}
                        </span>
                        {meta.next_page_url && (
                            <button className="btn btn-dark rounded-0 ms-2" onClick={() => setPage(page + 1)}>
                                التالي
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchantDetail;
