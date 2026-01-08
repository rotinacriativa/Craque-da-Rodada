"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

interface NewTransactionModalProps {
    groupId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewTransactionModal({ groupId, isOpen, onClose, onSuccess }: NewTransactionModalProps) {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("income");
    const [category, setCategory] = useState("other");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate amount
            const numericAmount = parseFloat(amount.replace(',', '.'));
            if (isNaN(numericAmount) || numericAmount <= 0) {
                alert("Valor inválido.");
                setLoading(false);
                return;
            }

            const { error } = await supabase.from('transactions').insert({
                group_id: groupId,
                description,
                amount: numericAmount,
                type,
                category,
                date,
            });

            if (error) throw error;

            // Reset form
            setDescription("");
            setAmount("");
            setType("income");
            setCategory("other");
            setDate(new Date().toISOString().split('T')[0]);

            onSuccess();
            onClose();

        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Erro ao criar transação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1a2c22] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nova Transação</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType("income")}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${type === "income" ? "bg-white dark:bg-[#0d1b12] text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                        >
                            Entrada
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("expense")}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${type === "expense" ? "bg-white dark:bg-[#0d1b12] text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                        >
                            Saída
                        </button>
                    </div>

                    {/* Amount */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input
                            required
                            type="text"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b]"
                        />
                    </div>

                    {/* Description */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Descrição</span>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Aluguel da Quadra"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#13ec5b]"
                        />
                    </label>

                    {/* Category */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Categoria</span>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#13ec5b]"
                        >
                            <option value="other">Outros</option>
                            <option value="match_fee">Mensalidade/Pagamento</option>
                            <option value="court_rental">Aluguel de Quadra</option>
                            <option value="equipment">Equipamentos/Material</option>
                            <option value="food_drink">Bar/Churrasco</option>
                        </select>
                    </label>

                    {/* Date */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Data</span>
                        <input
                            required
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#13ec5b]"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-2 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${type === 'income' ? 'bg-green-600 hover:bg-green-500 shadow-green-600/20' : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'}`}
                    >
                        {loading ? "Salvando..." : (type === 'income' ? "Adicionar Entrada" : "Registrar Saída")}
                    </button>
                </form>
            </div>
        </div>
    );
}
