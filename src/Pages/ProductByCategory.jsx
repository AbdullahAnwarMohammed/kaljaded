import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { RiArrowRightLine } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import ProductCard from '../components/CategorySection/ProductCard';
import ProductCardSkeleton from '../components/CategorySection/ProductCardSkeleton';
import "./ProductByCategory.css";
import "./RequestProduct.css";
import Api from '../Services/Api';

const ProductByCategory = ({ isInstallment = false }) => {
        const { t, i18n } = useTranslation();
    
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const subSlug = new URLSearchParams(location.search).get('sub');

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [categories, setCategories] = useState([]);

    const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

    const pathname = location.pathname;
    const isAllProducts = slug === 'all' || pathname === '/products';
    const isLatest = slug === 'latest';

    const fetchedSlugs = useRef(new Set());

    useEffect(() => {
        const cacheKey = `products_${slug || 'all'}_${subSlug || ''}_${isInstallment}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached && !isLatest) {
            const data = JSON.parse(cached);
            setProducts(data.products);
            setCategory(data.category);
            setLastPage(data.lastPage);
            setHasInitialLoaded(true);
        } else {
            setProducts([]);
            setCategory(null);
            setHasInitialLoaded(false);
        }

        const currentSlugKey = `${slug || 'all'}_${subSlug || ''}_${isInstallment}`;
        // If we haven't fetched this slug in this session, or if it's the first load
        if (!fetchedSlugs.current.has(currentSlugKey) || isLatest) {
            if (currentPage === 1) {
                fetchProducts(1);
            } else {
                setCurrentPage(1);
                fetchProducts(1);
            }
            if (!isLatest) fetchedSlugs.current.add(currentSlugKey);
        } else {
            // Already fetched in this session, just ensure we are on page 1
            if (currentPage !== 1) setCurrentPage(1);
            setHasInitialLoaded(true);
        }
    }, [slug, pathname, location.search, isInstallment]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchProducts(currentPage);
        }
    }, [currentPage]);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const cachedCats = localStorage.getItem('all_categories');
            if (cachedCats) setCategories(JSON.parse(cachedCats));

            const res = await Api.get("/categories", { cache: true, skipLoader: true });
            const data = res.data.data;
            setCategories(data);
            localStorage.setItem('all_categories', JSON.stringify(data));
        } catch (err) { console.error(err); }
    };


    const fetchProducts = async (page) => {
        if (loading && page > 1) return;
        
        try {
            // Only show loader if we don't have products (first time for this slug)
            const hasData = products.length > 0 && page === 1;
            setLoading(!hasData); 

            let url = '';
            if (isInstallment) {
                url = `/categories/products/active/${slug || ''}?page=${page}`;
                if (subSlug) url += `&sub=${subSlug}`;
            } else if (isLatest) {
                url = `/products/latest?page=${page}`;
            } else if (isAllProducts) {
                url = `/categories/products?page=${page}`;
            } else {
                url = `/categories/products/${slug}?page=${page}`;
                if (subSlug) url += `&sub=${subSlug}`;
            }

             const res = await Api.get(url, { 
                 skipLoader: true, // Handle locally for smoother tab switching
                 cache: page === 1 
             });

            const { category: catData, products: newProducts, meta } = res.data.data;

            let newCategoryData = null;
            if (isInstallment) newCategoryData = { name: 'الأقساط', subcategories: catData?.subcategories || [] };
            else if (isLatest) newCategoryData = { name: t("latest_available") };
            else if (!isAllProducts) newCategoryData = catData;
            else newCategoryData = { name: 'كل المنتجات' };

            setCategory(newCategoryData);
            setLastPage(meta.last_page);

            if (page === 1) {
                 const cacheKey = `products_${slug || 'all'}_${subSlug || ''}_${isInstallment}`;
                 localStorage.setItem(cacheKey, JSON.stringify({
                     products: newProducts,
                     category: newCategoryData,
                     lastPage: meta.last_page
                 }));
            }

            setProducts(prev => {
                if (page === 1) return newProducts;
                const productMap = new Map(prev.map(p => [p.id, p]));
                newProducts.forEach(p => productMap.set(p.id, p));
                return Array.from(productMap.values());
            });
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
            setHasInitialLoaded(true);
        }
    };

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
                !loading && currentPage < lastPage) {
                setCurrentPage(prev => prev + 1);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, currentPage, lastPage]);

    if (!isAllProducts && slug && !category && hasInitialLoaded && !loading) {
        return <p className="text-center mt-5">لا يوجد قسم بهذا الاسم</p>;
    }

    const showAllActive = !subSlug && (!slug || isInstallment);

    return (
        <div className="PageProductByCategory">
            {!isInstallment && (
                <div className="title container-fluid">
                    <Link className="back" to="/">
                        <RiArrowRightLine />
                    </Link>
                    <h4>{category?.name}</h4>
                </div>
            )}


            {/* الأقسام الرئيسية */}
            <div className="categories-tabs">
                <div className="categories-tabs-child">
                    <Link
                        className={`category-tab ${isAllProducts ? 'active' : ''}`}
                        to={isInstallment ? '/category/installments' : '/products'}
                    >الكل</Link>
                    
                    {!isInstallment && (
                        <Link
                            className={`category-tab ${isLatest ? 'active' : ''}`}
                            to="/category/latest"
                        >{t("latest_available")}</Link>
                    )}

                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            className={`category-tab ${cat.slug === slug ? "active" : ""}`}
                            to={isInstallment ? `/category/installments/${cat.slug}` : `/category/${cat.slug}`}
                        >{cat.name}</Link>
                    ))}
                </div>
            </div>

            {/* الأقسام الفرعية */}
            {category?.subcategories?.length > 0 && (
                <div className="subcategories-tabs">
                    <div className="subcategories-tabs-child">
                        <Link
                            className={`subcategory-tab ${!subSlug ? 'active' : ''}`}
                            to={isInstallment ? `/category/installments/${slug || ''}` : `/category/${slug}`}
                        >الكل</Link>
                        {category.subcategories.map(sub => (
                            <Link
                                key={sub.id}
                                className={`subcategory-tab ${String(sub.slug) === String(subSlug) ? "active" : ""}`}
                                to={isInstallment ? `/category/installments/${slug}?sub=${sub.slug}` : `/category/${slug}?sub=${sub.slug}`}
                            >{sub.name}</Link>
                        ))}
                    </div>
                </div>
            )}

            {/* المنتجات */}
            <div className="products-row">
                <div className="products-grid">
                    {products.map(product => (
                        <ProductCard key={product.id} p={product} />
                    ))}
                    
                    {/* عرض Skeletons أثناء التحميل إذا لم يكن هناك منتجات أو تحميل صفحة جديدة */}
                    {loading && (products.length === 0 || currentPage > 1) && Array.from({ length: 4 }).map((_, idx) => (
                        <ProductCardSkeleton key={`skeleton-${idx}`} />
                    ))}
                </div>

                {!loading && products.length === 0 && (
                     <div className="request-product-content" style={{ marginTop: '20px' }}>
                        <div className="text-center">
                            <BsBoxSeam size={80} className="empty-state-icon" />
                            <h5 className="empty-state-text">{t("no_products")}</h5>
                        </div>

                        <div className="whatsapp-button-container" style={{ marginTop: '30px' }}>
                            <button
                                onClick={() => window.open("https://wa.me/+96567691171", "_blank")}
                                className="btn whatsapp-button"
                            >
                                <FaWhatsapp size={20} />
                                <span>{t("contact_us_whatsapp")}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>        
        </div>
    );
};

export default ProductByCategory;
