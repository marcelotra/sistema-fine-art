import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { type Material, INITIAL_MATERIALS } from '../types';

export const useProducts = () => {
    const [products, setProducts] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('products').select('*');

            if (error) throw error;

            if (!data || data.length === 0) {
                // If DB is empty, seed with initial materials
                await seedInitialData();
            } else {
                // Map fields from DB (snake_case) to Frontend (camelCase)
                const mappedProducts: Material[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    pricePerM2: Number(item.price_per_m2),
                    costPrice: item.cost_price ? Number(item.cost_price) : undefined,
                    description: item.description,
                    image: item.image_url
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback? Or just alert?
        } finally {
            setLoading(false);
        }
    };

    const seedInitialData = async () => {
        const payload = INITIAL_MATERIALS.map(m => ({
            id: m.id,
            name: m.name,
            category: m.category,
            price_per_m2: m.pricePerM2,
            cost_price: m.costPrice,
            description: m.description,
            image_url: m.image
        }));

        const { error } = await supabase.from('products').insert(payload);
        if (!error) {
            setProducts(INITIAL_MATERIALS);
        } else {
            console.error('Error seeding data:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addProduct = async (product: Material) => {
        const payload = {
            id: product.id,
            name: product.name,
            category: product.category,
            price_per_m2: product.pricePerM2,
            cost_price: product.costPrice,
            description: product.description,
            image_url: product.image
        };

        const { error } = await supabase.from('products').insert([payload]);

        if (error) {
            console.error('Error adding product:', error);
            alert('Erro ao salvar no banco de dados');
        } else {
            setProducts(prev => [...prev, product]);
        }
    };

    const updateProduct = async (updated: Material) => {
        const payload = {
            name: updated.name,
            category: updated.category,
            price_per_m2: updated.pricePerM2,
            cost_price: updated.costPrice,
            description: updated.description,
            image_url: updated.image
        };

        const { error } = await supabase.from('products').update(payload).eq('id', updated.id);

        if (error) {
            console.error('Error updating product:', error);
            alert('Erro ao atualizar no banco de dados');
        } else {
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        }
    };

    const deleteProduct = async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            alert('Erro ao excluir do banco de dados');
        } else {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    return {
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct
    };
};
