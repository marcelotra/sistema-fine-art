import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCompanySettings } from '../hooks/useCompanySettings';
import type { Material } from '../types';
import { Edit2, Plus, Trash2, LogIn, Save, Building, Package } from 'lucide-react';

const AdminScreen: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const { products, loading: loadingProducts, addProduct, updateProduct, deleteProduct } = useProducts();
    const { settings, loading: loadingSettings, updateSettings } = useCompanySettings();

    // UI State
    const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'COMPANY'>('PRODUCTS');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [productForm, setProductForm] = useState<Partial<Material>>({});
    const [companyForm, setCompanyForm] = useState<any>({});

    useEffect(() => {
        if (settings) {
            setCompanyForm(settings);
        }
    }, [settings]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Senha incorreta!');
        }
    };

    // --- Product Handlers ---
    const handleEditProduct = (product: Material) => {
        setEditingId(product.id);
        setProductForm(product);
    };

    const handleCreateProduct = () => {
        setEditingId('NEW');
        setProductForm({
            id: Math.random().toString(36).substr(2, 9),
            category: 'PHOTO',
            pricePerM2: 0,
            costPrice: 0,
            description: '',
            image: ''
        });
    };

    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.pricePerM2) return alert('Preencha nome e preço');
        const mat = productForm as Material;
        if (editingId === 'NEW') {
            addProduct(mat);
        } else {
            updateProduct(mat);
        }
        setEditingId(null);
        setProductForm({});
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Tem certeza?')) {
            deleteProduct(id);
        }
    };

    // --- Company Handlers ---
    const handleSaveCompany = () => {
        updateSettings(companyForm);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Acesso Restrito</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg mb-4"
                        placeholder="Senha"
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold flex justify-center gap-2">
                        <LogIn /> Entrar
                    </button>
                </form>
            </div>
        );
    }

    if (loadingProducts || loadingSettings) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500 font-bold animate-pulse">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>

                    {/* Tabs */}
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setActiveTab('PRODUCTS')}
                            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all ${activeTab === 'PRODUCTS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Package size={18} /> Produtos
                        </button>
                        <button
                            onClick={() => setActiveTab('COMPANY')}
                            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all ${activeTab === 'COMPANY' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Building size={18} /> Empresa
                        </button>
                    </div>
                </div>

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'PRODUCTS' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-end mb-4">
                            <button onClick={handleCreateProduct} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                                <Plus /> Novo Produto
                            </button>
                        </div>

                        {/* Editor Modal */}
                        {editingId && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
                                    <h3 className="text-xl font-bold mb-4">{editingId === 'NEW' ? 'Novo Produto' : 'Editar Produto'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nome</label>
                                            <input
                                                className="w-full p-2 border rounded"
                                                value={productForm.name || ''}
                                                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Categoria</label>
                                                <select
                                                    className="w-full p-2 border rounded"
                                                    value={productForm.category}
                                                    onChange={e => setProductForm({ ...productForm, category: e.target.value as any })}
                                                >
                                                    <option value="PHOTO">Linha Photo</option>
                                                    <option value="FINE_ART">Linha Fine Art</option>
                                                    <option value="CANVAS">Linha Canvas</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Venda/m²</label>
                                                    <input type="number" className="w-full p-2 border rounded" value={productForm.pricePerM2 || ''} onChange={e => setProductForm({ ...productForm, pricePerM2: Number(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-slate-500">Custo/m²</label>
                                                    <input type="number" className="w-full p-2 border rounded bg-slate-50" value={productForm.costPrice || ''} onChange={e => setProductForm({ ...productForm, costPrice: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Descrição</label>
                                            <textarea
                                                className="w-full p-2 border rounded h-24"
                                                value={productForm.description || ''}
                                                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
                                        <button onClick={handleSaveProduct} className="px-4 py-2 bg-slate-900 text-white rounded flex items-center gap-2">
                                            <Save size={18} /> Salvar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold">Produto</th>
                                        <th className="p-4 font-semibold">Categoria</th>
                                        <th className="p-4 font-semibold">Preço/m²</th>
                                        <th className="p-4 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {products.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="font-bold">{p.name}</div>
                                                <div className="text-sm text-slate-500 truncate max-w-xs">{p.description}</div>
                                            </td>
                                            <td className="p-4"><span className="px-2 py-1 bg-slate-200 rounded text-xs font-bold">{p.category}</span></td>
                                            <td className="p-4 font-mono">R$ {p.pricePerM2.toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- COMPANY TAB --- */}
                {activeTab === 'COMPANY' && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 animate-fadeIn">
                        <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Dados da Empresa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Empresa</label>
                                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={companyForm.name || ''}
                                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">CNPJ</label>
                                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={companyForm.cnpj || ''}
                                    onChange={e => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={companyForm.phone || ''}
                                    onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Endereço Completo</label>
                                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={companyForm.address || ''}
                                    onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={companyForm.email || ''}
                                    onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Site / Instagram</label>
                                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={companyForm.website || ''}
                                    onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={handleSaveCompany} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg">
                                <Save size={20} /> Salvar Alterações
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminScreen;
