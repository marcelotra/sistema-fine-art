import { useState, useEffect } from 'react';
import { type Material, INITIAL_MATERIALS } from '../types';

export const useProducts = () => {
    const [products, setProducts] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('fine_art_products');
        if (saved) {
            setProducts(JSON.parse(saved));
        } else {
            setProducts(INITIAL_MATERIALS);
            localStorage.setItem('fine_art_products', JSON.stringify(INITIAL_MATERIALS));
        }
        setLoading(false);
    }, []);

    const saveProducts = (newProducts: Material[]) => {
        setProducts(newProducts);
        localStorage.setItem('fine_art_products', JSON.stringify(newProducts));
    };

    const addProduct = (product: Material) => {
        const newProducts = [...products, product];
        saveProducts(newProducts);
    };

    const updateProduct = (updated: Material) => {
        const newProducts = products.map(p => p.id === updated.id ? updated : p);
        saveProducts(newProducts);
    };

    const deleteProduct = (id: string) => {
        const newProducts = products.filter(p => p.id !== id);
        saveProducts(newProducts);
    };

    return {
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct
    };
};
