"use client";

import { useState } from "react";
import { supabase } from "../../src/lib/client";

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupId: string;
}

export default function AddExpenseModal({
    isOpen,
    onClose,
    onSuccess,
    groupId
}: AddExpenseModalProps) {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("aluguel");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate
            if (!description || !amount || !date) {
                alert("Preencha todos os campos obrigatórios.");
                setLoading(false);
                return;
            }

            // Parse Amount (assuming user types 100,50 or 100.50)
            const numericAmount = parseFloat(amount.replace(',', '.'));
            if (isNaN(numericAmount) || numericAmount <= 0) {
                alert("Valor inválido.");
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('transactions')
                .insert({
                    group_id: groupId,
                    description,
                    amount: numericAmount,
                    type: 'expense',
                    category,
                    payment_method: 'outros',
                    created_at: new Date(date).toISOString()
                });

            if (error) throw error;

            // Reset and close
            setDescription("");
            setAmount("");
            setCategory("aluguel");
            onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Error adding expense:", error);
            alert("Erro ao adicionar despesa: " + (error.message || "Erro desconhecido"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a2c22] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
                <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-[#0d1b12] dark:text-white">
                            Nova Despesa
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Descrição
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Pagamento do Campo"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-0 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-0 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Categoria
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-0 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                            >
                                <option value="aluguel">Aluguel do Campo</option>
                                <option value="equipamento">Equipamento (Bola, Colete)</option>
                                <option value="juiz">Juiz / Arbitragem</option>
                                <option value="goleiro">Goleiro</option>
                                <option value="confraternizacao">Churrasco / Cerva</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Data
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-0 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">paid</span>
                                        <span>Adicionar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
