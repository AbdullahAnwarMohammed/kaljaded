import React from "react";
import "./CategorySection.css";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";
import { IoIosArrowForward } from "react-icons/io";

const CategorySection = ({ data, onViewAll }) => {
    const { t } = useTranslation();

    const { category, products } = data;

    return (
        <div className="container">
            <div className="category-section">
                <div className="category-header">
                    <h3>{category.name}</h3>
                    <button className="read-all" onClick={onViewAll}>
                        {t("view_all")}  <IoIosArrowForward  />
                    </button>
                </div>

                <div className="products-row">
                    {products.map((p) => (
                        <ProductCard key={p.id} p={p} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default CategorySection;
