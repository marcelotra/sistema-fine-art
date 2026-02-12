import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface CompanySettings {
    id: string;
    name: string;
    cnpj?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
}

export const useCompanySettings = () => {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .limit(1)
                .single();

            if (error) {
                // If specific error 'PGRST116' (no rows), we might need to insert default
                if (error.code === 'PGRST116') {
                    // Auto-create? Or handle in UI? 
                    // For now let's assume the SQL script inserted one.
                    return;
                }
                throw error;
            }

            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching company settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<CompanySettings>) => {
        if (!settings?.id) return;

        const { error } = await supabase
            .from('company_settings')
            .update(newSettings)
            .eq('id', settings.id);

        if (error) {
            console.error('Error updating settings:', error);
            alert('Erro ao atualizar configurações');
        } else {
            setSettings({ ...settings, ...newSettings });
            alert('Configurações salvas!');
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        loading,
        updateSettings
    };
};
