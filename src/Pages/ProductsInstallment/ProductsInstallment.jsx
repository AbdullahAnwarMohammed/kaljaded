import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { RiArrowRightLine } from "react-icons/ri";
import ProductCard from '../components/CategorySection/ProductCard';
import Api from '../Services/Api';
import "./ProductByCategory.css";

const ProductsInstallment = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selectedCategorySlug, setSelectedCategorySlug] = useState(""); // القسم المحدد
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // جلب الأقسام مرة واحدة
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await Api.get('/categories'); // افترض عندك API للأقسام
                setCategories(res.data.data.categories);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    // إعادة تعيين الصفحة عند تغيير البحث أو القسم
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategorySlug]);

    // جلب المنتجات عند تغير الصفحة، البحث أو القسم
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, searchTerm, selectedCategorySlug]);

    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);

            // تحديد الـ endpoint حسب القسم المحدد
            const endpoint = selectedCategorySlug
                ? `/categories/products/${selectedCategorySlug}?page=${page}&search=${searchTerm}&price_active=1`
                : `/categories/products?page=${page}&search=${searchTerm}&price_active=1`;

            const res = await Api.get(endpoint);
            const { products, meta } = res.data.data;

            setProducts(products);
            setLastPage(meta.last_page);
        } catch (err) {
            console.error(err);
            setProducts([]);
            setLastPage(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ProductsByCategoryPage">
          

            {/* Filter بالقسم */}
            <select
                className="form-select mb-3"
                value={selectedCategorySlug}
                onChange={e => setSelectedCategorySlug(e.target.value)}
            >
                <option value="">كل الأقسام</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                        {cat.name}
                    </option>
                ))}
            </select>

            {/* Search Box */}
            <div className="search-box mb-3">
                <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            fetchProducts(1);
                        }
                    }}
                    className="form-control"
                />
                <button
                    className="btn btn-dark mt-2"
                    onClick={e => {
                        e.preventDefault();
                        fetchProducts(1);
                    }}
                >
                    بحث
                </button>
            </div>

            {/* Products Grid */}
            <div className="products-row">
                {loading ? (
                    <p>جاري تحميل المنتجات...</p>
                ) : products.length === 0 ? (
                    <p>لا توجد منتجات بالقسط في هذا القسم</p>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product.id} p={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && products.length > 0 && (
                <div className="pagination mt-4 d-flex justify-content-center align-items-center gap-3">
                    <button
                        className='btn btn-dark rounded-0'
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        السابق
                    </button>

                    <span>{currentPage} / {lastPage}</span>

                    <button
                        className='btn btn-dark rounded-0'
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        التالي
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductsInstallment;
