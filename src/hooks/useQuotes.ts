import { useState } from 'react';
import { supabase } from '../services/supabase';

export interface Quote {
    id: string;
    sequence_id: number;
    customer_name: string;
    customer_contact: string;
    total_amount: number;
    status: string;
    items: any[];
    created_at: string;
}

export const useQuotes = () => {
    const [loading, setLoading] = useState(false);
    const [quotes, setQuotes] = useState<Quote[]>([]);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('sequence_id', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveQuote = async (
        customer: { name: string; contact: string },
        total: number,
        items: any[]
    ) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('quotes')
                .insert([
                    {
                        customer_name: customer.name,
                        customer_contact: customer.contact,
                        total_amount: total,
                        status: 'COMPLETED',
                        items: items
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            return data as Quote;
        } catch (error) {
            console.error('Error saving quote:', error);
            alert('Erro ao salvar orçamento');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteQuote = async (id: string) => {
        try {
            const { error } = await supabase
                .from('quotes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setQuotes(prev => prev.filter(q => q.id !== id));
            return true;
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert('Erro ao excluir orçamento');
            return false;
        }
    };

    return {
        quotes,
        loading,
        fetchQuotes,
        saveQuote,
        deleteQuote
    };
};
