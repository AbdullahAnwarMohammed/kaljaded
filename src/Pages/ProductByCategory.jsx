import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { RiArrowRightLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import ProductCard from '../components/CategorySection/ProductCard';
import ProductCardSkeleton from '../components/CategorySection/ProductCardSkeleton';
import "./ProductByCategory.css";
import Api from '../Services/Api';

const ProductByCategory = ({ isInstallment = false }) => {
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

    const pathname = location.pathname;
    const isAllProducts = slug === 'all' || pathname === '/products';

    useEffect(() => {
        const cacheKey = `products_${slug || 'all'}_${subSlug || ''}_${isInstallment}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const data = JSON.parse(cached);
            setProducts(data.products);
            setCategory(data.category);
            setLastPage(data.lastPage);
        } else {
            setProducts([]);
            setCategory(null);
        }

        if (currentPage === 1) {
            fetchProducts(1);
        } else {
            // This will trigger the reset, but we also need to fetch the new category's page 1
            setCurrentPage(1);
            fetchProducts(1);
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
            // Try to load from localStorage first for instant UI
            const cachedCats = localStorage.getItem('all_categories');
            if (cachedCats) {
                setCategories(JSON.parse(cachedCats));
            }

            const res = await Api.get("/categories", { cache: true });
            const data = res.data.data;
            setCategories(data);
            localStorage.setItem('all_categories', JSON.stringify(data));
        } catch (err) { console.error(err); }
    };


    const fetchProducts = async (page, isInitial = false) => {
        if (loading && page > 1) return;
        
        try {
            setLoading(true); 
            let url = '';

            if (isInstallment) {
                url = `/categories/products/active/${slug || ''}?page=${page}`;
                if (subSlug) url += `&sub=${subSlug}`;
            } else if (isAllProducts) {
                url = `/categories/products?page=${page}`;
            } else {
                url = `/categories/products/${slug}?page=${page}`;
                if (subSlug) url += `&sub=${subSlug}`;
            }

             const hasCached = products.length > 0 && page === 1;
             // Use global API cache for first page to make it near-instant if visited before
             const res = await Api.get(url, { 
                 skipLoader: hasCached,
                 cache: page === 1 
             });

            const { category: catData, products: newProducts, meta } = res.data.data;

            let newCategoryData = null;
            if (isInstallment) newCategoryData = { name: 'الأقساط', subcategories: catData?.subcategories || [] };
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

    if (!isAllProducts && slug && !category && !loading) {
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
                    <div className="text-center mt-5 w-100">
                        <p className="text-muted">لا يوجد بيانات في الوقت الحالي</p>
                    </div>
                )}
            </div>        
        </div>
    );
};

export default ProductByCategory;
