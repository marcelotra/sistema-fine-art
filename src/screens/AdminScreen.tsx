import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import type { Material } from '../types';
import { Edit2, Plus, Trash2, LogIn, Save } from 'lucide-react';

const AdminScreen: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Material>>({});

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Senha incorreta!');
        }
    };

    const handleEdit = (product: Material) => {
        setEditingId(product.id);
        setFormData(product);
    };

    const handleCreate = () => {
        setEditingId('NEW');
        setFormData({
            id: Math.random().toString(36).substr(2, 9),
            category: 'PHOTO',
            pricePerM2: 0,
            costPrice: 0,
            description: '',
            image: ''
        });
    };

    const handleSave = () => {
        if (!formData.name || !formData.pricePerM2) return alert('Preencha nome e preço');

        const mat = formData as Material;

        if (editingId === 'NEW') {
            addProduct(mat);
        } else {
            updateProduct(mat);
        }
        setEditingId(null);
        setFormData({});
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza?')) {
            deleteProduct(id);
        }
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500 font-bold animate-pulse">Carregando produtos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Gerenciar Produtos</h1>
                    <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                        <Plus /> Novo Produto
                    </button>
                </div>

                {/* Editor Modal/Panel */}
                {editingId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">{editingId === 'NEW' ? 'Novo Produto' : 'Editar Produto'}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Categoria</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                        >
                                            <option value="PHOTO">Linha Photo</option>
                                            <option value="FINE_ART">Linha Fine Art</option>
                                            <option value="CANVAS">Linha Canvas</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Preço Venda/m² (R$)</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded"
                                                value={formData.pricePerM2 || ''}
                                                onChange={e => setFormData({ ...formData, pricePerM2: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-500">Custo/m² (R$)</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded bg-slate-50"
                                                value={formData.costPrice || ''}
                                                onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Descrição</label>
                                    <textarea
                                        className="w-full p-2 border rounded h-24"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white rounded flex items-center gap-2">
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
                                        <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminScreen;
