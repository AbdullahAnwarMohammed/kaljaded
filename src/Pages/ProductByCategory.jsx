import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RiArrowRightLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import ProductCard from '../components/CategorySection/ProductCard';
import "./ProductByCategory.css";
import Api from '../Services/Api';

const ProductByCategory = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isInstallmentsPage = location.pathname.startsWith('/installments');

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // إعادة تعيين الصفحة عند تغيير القسم أو البحث أو الفلتر
    useEffect(() => {
        setCurrentPage(1);
    }, [slug, searchTerm, priceFilter, isInstallmentsPage]);

    // جلب البيانات
    useEffect(() => {
        fetchData(currentPage);
    }, [slug, currentPage, searchTerm, priceFilter, isInstallmentsPage]);

    const fetchData = async (page = 1) => {
        try {
            setProductsLoading(true);

            let url = "";

            if (isInstallmentsPage) {
                url = slug
                    ? `/products/installments/${slug}?page=${page}&search=${searchTerm}`
                    : `/products/installments?page=${page}&search=${searchTerm}`;
            } else {
                url = `/categories/products/${slug}?page=${page}&search=${searchTerm}${priceFilter ? '&price_active=1' : ''}`;
            }

            const res = await Api.get(url);
            const { category, products, meta } = res.data.data;

            setCategory(category);
            setProducts(products);
            setLastPage(meta.last_page);
        } catch (error) {
            console.error(error);
            setProducts([]);
            setLastPage(1);
        } finally {
            setProductsLoading(false);
        }
    };
    if (slug && !category && !productsLoading) {
        return (
            <p className="text-center mt-5">
                لا يوجد قسم بهذا الاسم
            </p>
        );
    }
    return (
        <div className="PageProductByCategory">

            {/* العنوان */}
            <div className="title">
                <span
                    className="back"
                    onClick={() => navigate(-1)}
                    style={{ cursor: "pointer" }}
                >
                    <RiArrowRightLine />
                </span>
                <h4>{category?.name || "منتجات التقسيط"}</h4>
            </div>

            {/* Sub Categories */}
            {category?.subcategories?.length > 0 && (
                <div className="subcategory">
                    <span
                        className={!slug ? "active" : ""}
                        onClick={() =>
                            navigate(isInstallmentsPage ? "/installments" : `/category/${category.slug}`)
                        }
                    >
                        الكل
                    </span>

                    {category.subcategories.map(sub => (
                        <span
                            key={sub.id}
                            onClick={() =>
                                navigate(
                                    isInstallmentsPage
                                        ? `/installments/${sub.slug}`
                                        : `/category/${sub.slug}`
                                )
                            }
                            style={{ cursor: "pointer" }}
                        >
                            {sub.name}
                        </span>
                    ))}
                </div>
            )}

            {/* فلتر القسط (يظهر فقط في صفحة الأقسام) */}
            {!isInstallmentsPage && (
                <div className="mb-3 text-center my-4">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={priceFilter}
                            onChange={() => setPriceFilter(prev => !prev)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span style={{ marginLeft: '10px' }}>
                        عرض المنتجات بالقسط فقط
                    </span>
                </div>
            )}

            {/* Search */}
            <div className="search-box mt-3 mb-3">
                <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-control"
                />
            </div>

            {/* Products */}
            <div className="products-row">
                <div className="products-grid">
                    {productsLoading ? (
                        <p>جاري تحميل المنتجات...</p>
                    ) : products.length === 0 ? (
                        <p>لا توجد منتجات</p>
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id} p={product} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!productsLoading && products.length > 0 && (
                    <div className="pagination mt-4 d-flex justify-content-center align-items-center gap-3">
                        <button
                            className="btn btn-dark rounded-0"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            السابق
                        </button>

                        <span>{currentPage} / {lastPage}</span>

                        <button
                            className="btn btn-dark rounded-0"
                            disabled={currentPage === lastPage}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductByCategory;
