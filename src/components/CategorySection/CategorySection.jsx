import React from "react";
import "./CategorySection.css";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";
import { IoIosArrowForward } from "react-icons/io";

const CategorySection = React.memo(({ data, onViewAll, isSold = false }) => {
    const { t } = useTranslation();

    const { category, products } = data;

    return (
        <div className="container">
            <div className="category-section">
                <div className="category-header">
                    <h3>{category.name}</h3>
                    {onViewAll && (
                        <button className="read-all" onClick={onViewAll}>
                            {t("view_all")}  <IoIosArrowForward  />
                        </button>
                    )}
                </div>

                <div className="category-horizontal-scroll">
                    {products.map((p) => (
                        <ProductCard key={p.id} p={p} isSold={isSold} />
                    ))}
                </div>

            </div>
        </div>
    );
});

export default CategorySection;
