import React, { useState, useMemo } from 'react';
import { Check, Image as ImageIcon, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

// Helper to format currency
const formatMoney = (val: number) => `R$ ${val.toFixed(2)}`;

interface CartItem {
    id: string; // unique ID for the cart item
    width: number;
    height: number;
    materialId: string;
    materialName: string;
    margin: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    finalW: number;
    finalH: number;
    details?: string;
}

const QuoteScreen: React.FC = () => {
    const { products: MATERIALS, loading } = useProducts();

    // --- Global Cart State ---
    const [cart, setCart] = useState<CartItem[]>([]);

    // --- Current Item Form State ---
    const [width, setWidth] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [margin, setMargin] = useState(0);

    // --- Checkout State ---
    const [view, setView] = useState<'QUOTE' | 'CHECKOUT'>('QUOTE');
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'CASH'>('PIX');

    // Derived
    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId);
    const isValidDimensions = Number(width) > 0 && Number(height) > 0;

    // Smart Roll Optimization Logic
    const currentItemQuote = useMemo(() => {
        if (!isValidDimensions || !selectedMaterial) return null;

        const wInput = Number(width) + (margin * 2);
        const hInput = Number(height) + (margin * 2);

        // Defined Rolls (in cm)
        const ROLLS = [61, 111];

        // Find best fit
        let bestOption = null;
        let minCost = Infinity;

        // Check each roll
        for (const rollWidth of ROLLS) {
            // Check Orientation 1: Width aligns with Roll Width
            if (wInput <= rollWidth) {
                const wasteW = rollWidth - wInput;
                const totalAreaM2 = (rollWidth / 100) * (hInput / 100);
                const printAreaM2 = (wInput / 100) * (hInput / 100);
                const wasteAreaM2 = totalAreaM2 - printAreaM2;

                const wastePricePerM2 = selectedMaterial.costPrice ?? (selectedMaterial.pricePerM2 * 0.3);

                const cost = (printAreaM2 * selectedMaterial.pricePerM2) + (wasteAreaM2 * wastePricePerM2);

                if (cost < minCost) {
                    minCost = cost;
                    bestOption = {
                        rollWidth,
                        orientation: 'portrait',
                        usedWidth: rollWidth,
                        usedLength: hInput,
                        wasteWidth: wasteW,
                        totalAreaM2: totalAreaM2,
                        totalCost: cost
                    };
                }
            }

            // Check Orientation 2: Height aligns with Roll Width
            if (hInput <= rollWidth) {
                const wasteW = rollWidth - hInput;
                const totalAreaM2 = (rollWidth / 100) * (wInput / 100);
                const printAreaM2 = (hInput / 100) * (wInput / 100);
                const wasteAreaM2 = totalAreaM2 - printAreaM2;

                const wastePricePerM2 = selectedMaterial.costPrice ?? (selectedMaterial.pricePerM2 * 0.3);

                const cost = (printAreaM2 * selectedMaterial.pricePerM2) + (wasteAreaM2 * wastePricePerM2);

                if (cost < minCost) {
                    minCost = cost;
                    bestOption = {
                        rollWidth,
                        orientation: 'landscape',
                        usedWidth: rollWidth,
                        usedLength: wInput,
                        wasteWidth: wasteW,
                        totalAreaM2: totalAreaM2,
                        totalCost: cost
                    };
                }
            }
        }

        // Fallback if it doesn't fit any roll
        if (!bestOption) {
            const finalW = wInput / 100;
            const finalH = hInput / 100;
            const area = finalW * finalH;
            const cost = area * selectedMaterial.pricePerM2;

            return {
                finalW,
                finalH,
                total: cost * quantity,
                unitPrice: cost,
                details: "Tamanho excede bobinas padrão"
            };
        }

        return {
            finalW: wInput / 100,
            finalH: hInput / 100,
            total: bestOption.totalCost * quantity,
            unitPrice: bestOption.totalCost,
            details: `Bobina ${bestOption.rollWidth}cm (Aprov: ${(((wInput * hInput) / (bestOption.usedWidth * bestOption.usedLength)) * 100).toFixed(0)}%)`
        };

    }, [width, height, margin, selectedMaterial, quantity, isValidDimensions]);

    // Add current item to cart
    const handleAddToCart = () => {
        if (!currentItemQuote || !selectedMaterial) return;

        const newItem: CartItem = {
            id: Math.random().toString(36).substr(2, 9),
            width: Number(width),
            height: Number(height),
            materialId: selectedMaterial.id,
            materialName: selectedMaterial.name,
            margin,
            quantity,
            unitPrice: currentItemQuote.unitPrice,
            totalPrice: currentItemQuote.total,
            finalW: currentItemQuote.finalW,
            finalH: currentItemQuote.finalH,
            details: currentItemQuote.details
        };

        setCart([...cart, newItem]);
        // Reset form completely for a fresh quote
        setWidth('');
        setHeight('');
        setSelectedMaterialId('');
        setQuantity(1);
        alert("Item adicionado ao pedido!");
    };

    const handleRemoveFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Calculate Grand Total
    const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

    // --- Checkout Logic ---
    const discount = (paymentMethod === 'PIX' || paymentMethod === 'CASH') ? 0.15 : 0;
    const finalTotal = cartTotal * (1 - discount);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleSendEmail = () => {
        const subject = `Pedido Fine Art - ${customer.name}`;
        const body = `Olá, gostaria de finalizar o seguinte pedido:\n\n` +
            `Cliente: ${customer.name}\n` +
            `Email: ${customer.email}\n` +
            `Telefone: ${customer.phone}\n\n` +
            `Itens:\n` +
            cart.map((item, i) => `${i + 1}. ${item.materialName} - ${item.width}x${item.height}cm (${item.quantity}un) - R$ ${item.totalPrice.toFixed(2)}`).join('\n') +
            `\n\nTotal: R$ ${finalTotal.toFixed(2)} (${paymentMethod === 'PIX' ? 'PIX/Dinheiro (-15%)' : 'Cartão'})\n`;

        window.open(`mailto:contato@molduraspanorama.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    // Group materials by category
    const materialsByCategory = useMemo(() => {
        const groups = {
            'PHOTO': [] as typeof MATERIALS,
            'FINE_ART': [] as typeof MATERIALS,
            'CANVAS': [] as typeof MATERIALS
        };
        MATERIALS.forEach(m => {
            const cat = m.category as keyof typeof groups;
            if (groups[cat]) groups[cat].push(m);
        });
        return groups;
    }, [MATERIALS]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

    // --- CHECKOUT VIEW ---
    if (view === 'CHECKOUT') {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fadeIn">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-center print:hidden">
                        <div>
                            <h1 className="text-2xl font-bold">Resumo do Pedido</h1>
                            <p className="text-slate-400 text-sm">Confira os detalhes para finalizar</p>
                        </div>
                        <button onClick={() => setView('QUOTE')} className="text-slate-300 hover:text-white transition-colors">
                            Voltar
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Column 1: Customer & Payment */}
                        <div className="space-y-8">
                            <section className="print:hidden">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                                    Seus Dados
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo</label>
                                        <input
                                            value={customer.name}
                                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 outline-none transition-all"
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Telefone</label>
                                            <input
                                                value={customer.phone}
                                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 outline-none"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                                            <input
                                                value={customer.email}
                                                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 outline-none"
                                                placeholder="nome@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="print:hidden">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                                    Pagamento
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setPaymentMethod('PIX')}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 
                                        ${paymentMethod === 'PIX' ? 'border-green-500 bg-green-50 text-green-800' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                    >
                                        <span className="font-bold">PIX / Dinheiro</span>
                                        <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">-15% OFF</span>
                                    </div>
                                    <div
                                        onClick={() => setPaymentMethod('CARD')}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 
                                        ${paymentMethod === 'CARD' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                    >
                                        <span className="font-bold">Cartão de Crédito</span>
                                        <span className="text-xs text-slate-500">Até 3x sem juros</span>
                                    </div>
                                </div>
                            </section>

                            {/* Visible only on print */}
                            <section className="hidden print:block">
                                <h2 className="text-xl font-bold mb-4">Dados do Cliente</h2>
                                <p><strong>Nome:</strong> {customer.name}</p>
                                <p><strong>Email:</strong> {customer.email}</p>
                                <p><strong>Telefone:</strong> {customer.phone}</p>
                            </section>
                        </div>

                        {/* Column 2: Review & Actions */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-fit print:border-0 print:bg-white print:p-0">
                            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Itens do Pedido</h3>
                            <div className="space-y-4 mb-6">
                                {cart.map((item, idx) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div>
                                            <span className="font-bold">{idx + 1}. {item.materialName}</span>
                                            <div className="text-slate-500 text-xs">{item.width}x{item.height}cm ({item.quantity}un)</div>
                                            {/* {item.details && <div className="text-xs text-slate-400">{item.details}</div>} */}
                                        </div>
                                        <span className="font-mono">{formatMoney(item.totalPrice)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-6 pt-4 border-t border-slate-200">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{formatMoney(cartTotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Desconto ({discount * 100}%)</span>
                                        <span>- {formatMoney(cartTotal * discount)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                    <span className="text-lg font-bold text-slate-800">Total Final</span>
                                    <span className="text-3xl font-bold text-indigo-900">{formatMoney(finalTotal)}</span>
                                </div>
                                {paymentMethod === 'CARD' && (
                                    <p className="text-sm text-slate-500 text-right">ou 3x de {formatMoney(finalTotal / 3)}</p>
                                )}
                            </div>

                            <div className="space-y-3 print:hidden">
                                <button onClick={handleSendEmail} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    Enviar Pedido por Email
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handlePrint} className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                                        Imprimir
                                    </button>
                                    <button onClick={handleExportPDF} className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                                        Baixar PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- QUOTE VIEW ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-lg text-white">
                            <ImageIcon size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Panorama Molduras - Impressão</h1>
                    </div>
                    {cart.length > 0 && (
                        <div className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            {cart.length} itens no pedido
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Builder (Inputs) - Spans 8 cols */}
                <div className="lg:col-span-8 space-y-8 animate-fadeIn">

                    {/* 1. Dimensions & Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm">1</span>
                                Dimensões
                            </h2>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Largura (cm)</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={e => setWidth(e.target.value)}
                                        className="w-full text-2xl font-bold p-2 border-b-2 border-slate-200 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                <span className="pb-3 text-slate-300 text-lg">X</span>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Altura (cm)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={e => setHeight(e.target.value)}
                                        className="w-full text-2xl font-bold p-2 border-b-2 border-slate-200 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm">2</span>
                                Acabamento
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-600">Margem (cm)</label>
                                    <div className="flex items-center gap-2 w-24">
                                        <input
                                            type="number"
                                            value={margin}
                                            onChange={e => setMargin(Number(e.target.value))}
                                            className="w-full text-center p-2 border rounded-lg font-bold outline-none focus:border-indigo-600"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-600">Quantidade</label>
                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded font-bold">-</button>
                                        <span className="font-mono w-8 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded font-bold">+</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 3. Materials Selection by Category */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm">3</span>
                            Escolha o Papel
                        </h2>

                        {/* Linha Photo */}
                        <div>
                            <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider ml-1">Linha Photo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materialsByCategory['PHOTO'].map(mat => (
                                    <MaterialCard
                                        key={mat.id}
                                        mat={mat}
                                        isSelected={selectedMaterialId === mat.id}
                                        onSelect={() => setSelectedMaterialId(mat.id)}
                                    />
                                ))}
                                {materialsByCategory['PHOTO'].length === 0 && <p className="text-sm text-slate-400 italic">Nenhum papel nesta categoria.</p>}
                            </div>
                        </div>

                        {/* Linha Fine Art */}
                        <div>
                            <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider ml-1 mt-4">Linha Fine Art</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materialsByCategory['FINE_ART'].map(mat => (
                                    <MaterialCard
                                        key={mat.id}
                                        mat={mat}
                                        isSelected={selectedMaterialId === mat.id}
                                        onSelect={() => setSelectedMaterialId(mat.id)}
                                    />
                                ))}
                                {materialsByCategory['FINE_ART'].length === 0 && <p className="text-sm text-slate-400 italic">Nenhum papel nesta categoria.</p>}
                            </div>
                        </div>

                        {/* Linha Canvas */}
                        <div>
                            <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider ml-1 mt-4">Linha Canvas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materialsByCategory['CANVAS'].map(mat => (
                                    <MaterialCard
                                        key={mat.id}
                                        mat={mat}
                                        isSelected={selectedMaterialId === mat.id}
                                        onSelect={() => setSelectedMaterialId(mat.id)}
                                    />
                                ))}
                                {materialsByCategory['CANVAS'].length === 0 && <p className="text-sm text-slate-400 italic">Nenhum papel nesta categoria.</p>}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary (Cart) - Spans 4 cols */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. Current Item Preview */}
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden relative">
                        <div className="bg-indigo-600 h-1 absolute top-0 w-full"></div>
                        <div className="p-5">
                            <h3 className="font-bold text-slate-800 mb-4">Orçamento Atual</h3>

                            {!currentItemQuote ? (
                                <div className="text-center py-6 text-slate-400 text-sm">
                                    Preencha as medidas para ver o preço
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Item</span>
                                        <span className="font-medium">{selectedMaterial?.name || 'Selecione um papel'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Medida Final</span>
                                        <span className="font-mono text-slate-700">
                                            {(currentItemQuote.finalW * 100).toFixed(1)} x {(currentItemQuote.finalH * 100).toFixed(1)} cm
                                        </span>
                                    </div>
                                    {/* Optimization details hidden as per request */}
                                    {/* {currentItemQuote.details && (
                                        <div className="flex justify-between text-sm bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                            <span className="text-indigo-800 font-medium">Otimização</span>
                                            <span className="font-bold text-indigo-700">{currentItemQuote.details}</span>
                                        </div>
                                    )} */}
                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                        <span className="text-xs text-slate-500">{quantity}x {formatMoney(currentItemQuote.unitPrice)}</span>
                                        <span className="text-2xl font-bold text-indigo-600">{formatMoney(currentItemQuote.total)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={!currentItemQuote || !selectedMaterial}
                                className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Adicionar ao Pedido
                            </button>
                        </div>
                    </div>

                    {/* 2. Order Cart List */}
                    {cart.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Seu Pedido ({cart.length})</h3>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {cart.map((item, idx) => (
                                    <div key={item.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors relative group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-slate-700">#{idx + 1} {item.materialName}</span>
                                            <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                                            <span>
                                                {item.width}x{item.height}cm
                                                {item.margin > 0 && ` + ${item.margin}cm borda`}
                                            </span>
                                            <span>{item.quantity} un</span>
                                        </div>
                                        <div className="font-mono font-medium text-slate-900 text-right">
                                            {formatMoney(item.totalPrice)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-slate-600 font-medium">Total do Pedido</span>
                                    <span className="text-2xl font-bold text-green-600">{formatMoney(cartTotal)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-3 rounded-xl font-bold transition-all"
                                        onClick={() => setCart([])}
                                    >
                                        Limpar
                                    </button>
                                    <button
                                        className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                        onClick={() => setView('CHECKOUT')}
                                    >
                                        <ShoppingCart size={20} /> Finalizar Pedido
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// Subcomponent for Material Card to keep main code clean
const MaterialCard = ({ mat, isSelected, onSelect }: { mat: any, isSelected: boolean, onSelect: () => void }) => (
    <div
        onClick={onSelect}
        className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative group
            ${isSelected
                ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200 ring-offset-2'
                : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
            }`}
    >
        <div className="flex justify-between items-start mb-2">
            <span className={`font-bold text-base ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                {mat.name}
            </span>
            {isSelected && <div className="bg-indigo-600 text-white p-1 rounded-full"><Check size={12} /></div>}
        </div>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-2">{mat.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50">
            <span className="font-mono text-xs text-slate-400">R$ {mat.pricePerM2}/m²</span>
        </div>
    </div>
);

export default QuoteScreen;
