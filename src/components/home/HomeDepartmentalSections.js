import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useDepartmental } from "../../contexts/DepartmentalContext";
import { useAuth } from "../../contexts/AuthContext";
import ProductMarqueeSection from "./ProductMarqueeSection";

const DepartmentalProductsSection = ({ department, onAddToCart, addingProductId }) => {
    const { api } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductsForDepartment = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/products/public/filtered", {
                    params: {
                        page: 1,
                        limit: 15,
                        department: department,
                        groupVariants: "true",
                        sortOrder: "random"
                    },
                });
                setProducts(response.data.products || []);
            } catch (err) {
                console.error(`Error fetching products for department ${department}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsForDepartment();
    }, [api, department]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (products.length === 0) return null;

    return (
        <ProductMarqueeSection
            title={department}
            products={products}
            onAddToCart={onAddToCart}
            addingProductId={addingProductId}
            linkTo={`/products?department=${encodeURIComponent(department)}`}
        />
    );
};

const HomeDepartmentalSections = ({ onAddToCart, addingProductId }) => {
    const { taxonomy, fetchTaxonomy, taxonomyLoading } = useDepartmental();

    useEffect(() => {
        // Asegurarse de que la taxonomía esté cargada si el array de departamentos está vacío
        if (!taxonomy.departments || taxonomy.departments.length === 0) {
            fetchTaxonomy();
        }
    }, [fetchTaxonomy, taxonomy.departments]);

    if (taxonomyLoading && (!taxonomy.departments || taxonomy.departments.length === 0)) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {taxonomy.departments &&
                taxonomy.departments.map((dept) => (
                    <DepartmentalProductsSection
                        key={dept}
                        department={dept}
                        onAddToCart={onAddToCart}
                        addingProductId={addingProductId}
                    />
                ))}
        </Box>
    );
};

export default HomeDepartmentalSections;
