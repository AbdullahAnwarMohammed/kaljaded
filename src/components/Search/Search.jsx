import React, { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { useTranslation } from "react-i18next";
import "./Search.css";
import Api from "../../Services/Api";

const Search = ({ merchantSlug }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔹 debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // 🔹 fetch products عند تغير debouncedQuery
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { q: debouncedQuery, per_page: 5 };
        let endpoint = "/user/products/search";

        if (merchantSlug) {
          endpoint = `/user/merchants/${merchantSlug}/products`;
        }

        const res = await Api.get(endpoint, { params });

        if (res.data.success) {
          // يدعم كل المنتجات أو منتجات التاجر فقط
          setResults(res.data.data.data || res.data.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err.response?.data || err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedQuery, merchantSlug]);

  return (
    <div className="search" style={{ position: "relative" }}>
      <div className="container">
        <div className="app-search">
          <a href="#" className="location-dot">
            <IoLocationOutline   />
          </a>
          <form
            action="#"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: "relative" }}
          >
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="form-control"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowDropdown(false), 200)
              }
            />
            <button type="submit">
              <IoIosSearch  />
            </button>

            {/* ===== Dropdown النتائج ===== */}
            {showDropdown && (
              <div
                className="search-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #ccc",
                  zIndex: 10,
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {loading && <p className="p-2">جاري التحميل...</p>}
                {!loading && results.length === 0 && (
                  <p className="p-2">لا توجد نتائج</p>
                )}
                {!loading &&
                  results.map((product) => (
                    <div
                      key={product.id}
                      className="search-item p-2"
                      style={{
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      onMouseDown={() => {
                        window.location.href = `/product/${product.slug}`;
                      }}
                    >
                      {product.name}
                    </div>
                  ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Search;
