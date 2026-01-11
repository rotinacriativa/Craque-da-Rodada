"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../../../../src/lib/client";
import AddExpenseModal from "../../../../../../components/AddExpenseModal";

// Helper to format currency
const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

// Helper to format date
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

export default function TransactionsHistoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [groupId]);

    useEffect(() => {
        filterData();
    }, [transactions, searchTerm, typeFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Manual Transactions
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (txError) throw txError;

            // 2. Fetch Payments (Paid ones are considered transactions/income)
            // We can also fetch pending ones if we want to show them as pending in the table?
            // The HTML shows a row with "Pendente". So let's fetch all payments.
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*, profiles:user_id(full_name, avatar_url)') // Assuming avatar_url exists, if not we handle it
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (paymentsError) throw paymentsError;

            // Combine Data
            type TransactionItem = {
                id: string;
                originalId: string;
                date: string;
                description: string;
                subtitle: string;
                amount: number;
                type: 'income' | 'expense';
                status: 'paid' | 'pending' | 'cancelled';
                participant: any;
                source: 'transaction' | 'payment';
            };
            const combined: TransactionItem[] = [];

            // Process Transactions
            if (txData) {
                txData.forEach(tx => {
                    combined.push({
                        id: `tx-${tx.id}`,
                        originalId: tx.id,
                        date: tx.created_at,
                        description: tx.description,
                        subtitle: tx.category,
                        amount: Number(tx.amount),
                        type: tx.type, // 'income' or 'expense'
                        status: 'paid', // Manual transactions are usually confirmed
                        participant: null, // No specific user for general expenses
                        source: 'transaction'
                    });
                });
            }

            // Process Payments
            if (paymentsData) {
                paymentsData.forEach(pay => {
                    combined.push({
                        id: `pay-${pay.id}`,
                        originalId: pay.id,
                        date: pay.created_at,
                        description: pay.type === 'MENSAL' ? 'Mensalidade' : 'Pagamento Avulso',
                        subtitle: pay.type === 'MENSAL' ? 'Referente ao Mês' : 'Jogo Específico',
                        amount: Number(pay.amount),
                        type: 'income', // Payments are income for the group
                        status: pay.status === 'PAGO' ? 'paid' : (pay.status === 'PENDENTE' ? 'pending' : 'cancelled'),
                        participant: pay.profiles,
                        source: 'payment'
                    });
                });
            }

            // Sort by Date Descending
            combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTransactions(combined);

            // Calculate Stats (Current Month)
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            let incomeSum = 0;
            let expenseSum = 0;
            let balanceSum = 0; // Total balance (all time? or calc from transactions?)
            // Usually balance is all time. Income/Expense cards usually show "This Month".

            // Let's calculate filter stats
            // For balance, we should ideally fetch the group's current balance or sum all confirmed transactions.
            // Let's sum all confirmed for balance.
            combined.forEach(item => {
                if (item.status === 'paid') {
                    if (item.type === 'income') balanceSum += item.amount;
                    else balanceSum -= item.amount;
                }
            });

            combined.forEach(item => {
                const d = new Date(item.date);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && item.status === 'paid') {
                    if (item.type === 'income') incomeSum += item.amount;
                    else expenseSum += item.amount;
                }
            });

            setStats({
                income: incomeSum,
                expense: expenseSum,
                balance: balanceSum
            });

        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let temp = [...transactions];

        // Type Filter
        if (typeFilter !== 'all') {
            temp = temp.filter(t => t.type === typeFilter);
        }

        // Search Filter
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            temp = temp.filter(t =>
                t.description.toLowerCase().includes(lowerQuery) ||
                (t.participant && t.participant.full_name.toLowerCase().includes(lowerQuery)) ||
                t.subtitle?.toLowerCase().includes(lowerQuery) ||
                t.amount.toString().includes(lowerQuery)
            );
        }

        setFilteredTransactions(temp);
    };

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 pb-20 flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
                        <Link href={`/dashboard/grupos/${groupId}/admin/financeiro`} className="hover:text-[#13ec5b] transition-colors">Financeiro</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-[#13ec5b]">Transações</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white tracking-tight">Histórico de Transações</h1>
                    <p className="text-gray-500 max-w-xl">Gerencie as receitas e despesas do seu grupo. Acompanhe quem pagou a mensalidade e os custos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#1a2c20] border border-gray-200 dark:border-[#2a4032] rounded-full hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors shadow-sm opacity-50 cursor-not-allowed" disabled>
                        <span className="material-symbols-outlined text-[#0d1b12] dark:text-white text-xl">file_download</span>
                        <span className="text-sm font-bold text-[#0d1b12] dark:text-white">Exportar</span>
                    </button>
                    <button
                        onClick={() => setIsAddExpenseModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#13ec5b] text-[#0d1b12] rounded-full hover:bg-[#0fd650] transition-colors shadow-lg shadow-[#13ec5b]/20"
                    >
                        <span className="material-symbols-outlined text-xl font-bold">add</span>
                        <span className="text-sm font-bold">Nova Transação</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Entradas */}
                <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-[#13ec5b]">trending_up</span>
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Total Entradas (Mês)</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{formatMoney(stats.income)}</span>
                    </div>
                </div>

                {/* Saídas */}
                <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-red-500">trending_down</span>
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Total Saídas (Mês)</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{formatMoney(stats.expense)}</span>
                    </div>
                </div>

                {/* Saldo */}
                <div className="bg-[#0d1b12] dark:bg-[#13ec5b] p-6 rounded-2xl shadow-lg border border-transparent flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 size-32 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <span className="material-symbols-outlined text-6xl text-white dark:text-[#0d1b12]">account_balance_wallet</span>
                    </div>
                    <span className="text-gray-400 dark:text-[#0d1b12]/70 text-sm font-medium">Saldo Atual</span>
                    <div className="flex items-baseline gap-2 z-10">
                        <span className="text-4xl font-black text-white dark:text-[#0d1b12] tracking-tight">{formatMoney(stats.balance)}</span>
                    </div>
                </div>
            </div>

            {/* Filters & Actions Area */}
            <div className="bg-white dark:bg-[#1a2c20] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] space-y-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Search */}
                    <div className="flex-1 max-w-lg relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-500">search</span>
                        </div>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#25382e] border-none rounded-xl text-[#0d1b12] dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#13ec5b]/50 text-sm font-medium transition-all"
                            placeholder="Buscar por descrição, nome ou valor..."
                            type="text"
                        />
                    </div>
                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Type Filter */}
                        <div className="flex p-1 bg-gray-50 dark:bg-[#25382e] rounded-xl">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === 'all' ? 'bg-white dark:bg-[#183020] shadow-sm text-[#0d1b12] dark:text-white' : 'text-gray-500 hover:text-[#0d1b12] dark:hover:text-white'}`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setTypeFilter('income')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === 'income' ? 'bg-white dark:bg-[#183020] shadow-sm text-[#0d1b12] dark:text-white' : 'text-gray-500 hover:text-[#0d1b12] dark:hover:text-white'}`}
                            >
                                Entradas
                            </button>
                            <button
                                onClick={() => setTypeFilter('expense')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === 'expense' ? 'bg-white dark:bg-[#183020] shadow-sm text-[#0d1b12] dark:text-white' : 'text-gray-500 hover:text-[#0d1b12] dark:hover:text-white'}`}
                            >
                                Saídas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#2a4032]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#25382e] border-b border-gray-100 dark:border-[#2a4032]">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500" scope="col">Data</th>
                                <th className="px-6 py-4 font-semibold text-gray-500" scope="col">Descrição</th>
                                <th className="px-6 py-4 font-semibold text-gray-500" scope="col">Participante</th>
                                <th className="px-6 py-4 font-semibold text-gray-500" scope="col">Tipo</th>
                                <th className="px-6 py-4 font-semibold text-gray-500" scope="col">Status</th>
                                <th className="px-6 py-4 font-semibold text-right text-gray-500" scope="col">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#1a2c20] divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Carregando transações...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-[#25382e]/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-[#0d1b12] dark:text-gray-300 font-medium capitalize">
                                            {formatDate(tx.date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[#0d1b12] dark:text-white">{tx.description}</div>
                                            <div className="text-xs text-gray-500 capitalize">{tx.subtitle || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.participant ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                                                        {tx.participant.avatar_url ? (
                                                            <img className="w-full h-full object-cover" src={tx.participant.avatar_url} alt="User" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                                                {tx.participant.full_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[#0d1b12] dark:text-gray-300 truncate max-w-[150px]">{tx.participant.full_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tx.type === 'income'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                }`}>
                                                <span className={`size-1.5 rounded-full ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {tx.type === 'income' ? 'Entrada' : 'Saída'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.status === 'paid' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#13ec5b]/10 text-[#0d1b12] dark:text-[#13ec5b] border border-[#13ec5b]/20">
                                                    Pago
                                                </span>
                                            )}
                                            {tx.status === 'pending' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                    Pendente
                                                </span>
                                            )}
                                            {tx.status === 'cancelled' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    Cancelado
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${tx.status === 'pending' ? 'opacity-60' : ''}`}>
                                            {tx.type === 'income' ? '+' : '-'} {formatMoney(tx.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Visual Only for now) */}
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-gray-500">Mostrando <span className="font-semibold text-[#0d1b12] dark:text-white">{filteredTransactions.length > 0 ? 1 : 0}</span> a <span className="font-semibold text-[#0d1b12] dark:text-white">{filteredTransactions.length}</span> de <span className="font-semibold text-[#0d1b12] dark:text-white">{filteredTransactions.length}</span> resultados</p>
                    <div className="flex gap-2">
                        <button disabled className="flex items-center justify-center size-9 rounded-full border border-gray-200 dark:border-[#2a4032] bg-white dark:bg-[#1a2c20] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#25382e] disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button disabled className="flex items-center justify-center size-9 rounded-full border border-gray-200 dark:border-[#2a4032] bg-white dark:bg-[#1a2c20] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#25382e] disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddExpenseModalOpen}
                onClose={() => setIsAddExpenseModalOpen(false)}
                onSuccess={fetchData}
                groupId={groupId}
            />
        </div>
    );
}
