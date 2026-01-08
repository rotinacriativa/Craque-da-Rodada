"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../../../src/lib/client";
import NewTransactionModal from "../../../../../components/NewTransactionModal";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    created_at: string;
}

export default function GroupFinancialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Totals
    const [balance, setBalance] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    // Filters (mock for now, or simple local filter)
    const [period, setPeriod] = useState<'month' | 'total'>('total');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('group_id', groupId)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const txs = data as Transaction[];
            setTransactions(txs);
            calculateTotals(txs);

        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (txs: Transaction[]) => {
        let income = 0;
        let expense = 0;

        txs.forEach(tx => {
            // Simple period filter logic could go here if needed
            if (tx.type === 'income') income += tx.amount;
            if (tx.type === 'expense') expense += tx.amount;
        });

        setTotalIncome(income);
        setTotalExpense(expense);
        setBalance(income - expense);
    };

    useEffect(() => {
        if (groupId) {
            fetchTransactions();
        }
    }, [groupId]);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f6f8f6] dark:bg-[#102216] relative z-10 overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 py-5 md:px-10 md:py-8 flex-shrink-0">
                <div className="max-w-6xl mx-auto w-full">
                    <nav className="flex flex-wrap items-center gap-2 text-sm md:text-base mb-8">
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href="/dashboard">Dashboard</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href={`/dashboard/grupos/${groupId}`}>Meu Grupo</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href={`/dashboard/grupos/${groupId}/admin`}>Admin</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium bg-white dark:bg-[#1a2c22] px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">Financeiro</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Financeiro do Grupo</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">Visão geral do caixa, arrecadações e despesas.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-[#1a2c22] p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            {/* Simple filter UI - functionality to be refined later */}
                            <button onClick={() => setPeriod('month')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === 'month' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>Este Mês</button>
                            <button onClick={() => setPeriod('total')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === 'total' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>Total</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 pb-12 md:px-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                        {/* Saldo */}
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden group">
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ${balance >= 0 ? 'bg-[#13ec5b]/10' : 'bg-red-500/10'}`}></div>
                            <div className="flex items-center gap-3 z-10">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined">account_balance</span>
                                </div>
                                <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Saldo em Caixa</span>
                            </div>
                            <div className="flex items-baseline gap-2 z-10">
                                <span className={`text-3xl md:text-4xl font-black ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                        {/* Entradas */}
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <span className="material-symbols-outlined">arrow_downward</span>
                                </div>
                                <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Entradas</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                    {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                        {/* Saídas */}
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined">arrow_upward</span>
                                </div>
                                <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Saídas</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                    {totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Transactions List */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transações Recentes</h3>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-1 bg-[#13ec5b] hover:bg-[#0fd652] text-slate-900 text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-lg shadow-[#13ec5b]/20"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Nova Transação
                                </button>
                            </div>

                            <div className="bg-white dark:bg-[#1a2c22] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[300px]">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-500">Carregando transações...</div>
                                ) : transactions.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                                        </div>
                                        <p className="text-slate-900 dark:text-white font-bold">Nenhuma movimentação ainda</p>
                                        <p className="text-slate-500 text-sm">Registre pagamentos ou despesas para começar.</p>
                                    </div>
                                ) : (
                                    transactions.map(tx => (
                                        <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                                <span className="material-symbols-outlined">{tx.type === 'income' ? 'add' : 'remove'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tx.description}</p>
                                                <p className="text-xs text-slate-500 capitalize">{tx.category === 'other' ? 'Outros' : tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-200'}`}>
                                                    {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column: Settings & Actions (Keep mostly static or simplified for now) */}
                        <div className="flex flex-col gap-6">
                            {/* PIX Card (Static for now, but actionable) */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#13ec5b] blur-[60px] opacity-20"></div>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-[#13ec5b]">qr_code_2</span>
                                    <h4 className="font-bold text-lg">Chave PIX do Grupo</h4>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10 mb-4">
                                    <p className="text-xs text-slate-400 mb-1">E-mail</p>
                                    <p className="font-mono text-sm tracking-wide truncate">pagamentos@craquedarodada.com.br</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        Copiar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NewTransactionModal
                groupId={groupId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { fetchTransactions(); setIsModalOpen(false); }}
            />
        </div>
    );
}
