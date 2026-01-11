"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../../../src/lib/client";
import AddExpenseModal from "../../../../../components/AddExpenseModal";

export default function GroupFinancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pendingPayments, setPendingPayments] = useState<any[]>([]);
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);

    // Modal State
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

    // Pix State
    const [pixKey, setPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("email");
    const [isEditingPix, setIsEditingPix] = useState(false);
    const [newPixKey, setNewPixKey] = useState("");
    const [newPixKeyType, setNewPixKeyType] = useState("email");

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Group Details (Pix Key)
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('pix_key, pix_key_type')
                .eq('id', groupId)
                .single();

            if (groupData) {
                setPixKey(groupData.pix_key || "");
                setPixKeyType(groupData.pix_key_type || "email");
                setNewPixKey(groupData.pix_key || "");
                setNewPixKeyType(groupData.pix_key_type || "email");
            }

            // 2. Fetch Transactions
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (txData) {
                let currentBalance = 0;
                let currentIncome = 0;
                let currentExpense = 0;

                txData.forEach((tx) => {
                    const amount = Number(tx.amount);
                    if (tx.type === 'income') {
                        currentBalance += amount;
                        currentIncome += amount;
                    } else {
                        currentBalance -= amount;
                        currentExpense += amount;
                    }
                });

                setBalance(currentBalance);
                setIncome(currentIncome);
                setExpense(currentExpense);
                setTransactions(txData.slice(0, 5)); // Show top 5
            }

            // 3. Fetch Payments (centralized from new table)
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*, profiles:user_id(full_name)')
                .eq('group_id', groupId)
                .eq('status', 'PENDENTE')
                .order('created_at', { ascending: false });

            if (paymentsData) {
                setPendingPayments(paymentsData);
                const pendingTotal = paymentsData.reduce((acc, curr) => acc + Number(curr.amount), 0);
                setTotalPendingAmount(pendingTotal);
            }

        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (paymentId: string) => {
        try {
            const { error } = await supabase
                .from('payments')
                .update({ status: 'PAGO', paid_at: new Date().toISOString() })
                .eq('id', paymentId);

            if (error) throw error;
            fetchData(); // Refresh
        } catch (error) {
            console.error("Error marking as paid:", error);
            alert("Erro ao confirmar pagamento.");
        }
    };

    const handleSavePix = async () => {
        try {
            const { error } = await supabase
                .from('groups')
                .update({ pix_key: newPixKey, pix_key_type: newPixKeyType })
                .eq('id', groupId);

            if (error) throw error;

            setPixKey(newPixKey);
            setPixKeyType(newPixKeyType);
            setIsEditingPix(false);
            alert("Chave PIX atualizada com sucesso!");
        } catch (error) {
            console.error("Error updating PIX:", error);
            alert("Erro ao atualizar chave PIX");
        }
    };

    const handleCopyPix = () => {
        if (!pixKey) return;

        // Try using the Clipboard API if available and secure
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(pixKey)
                .then(() => alert("Chave PIX copiada para a área de transferência!"))
                .catch(() => fallbackCopyTextToClipboard(pixKey));
        } else {
            fallbackCopyTextToClipboard(pixKey);
        }
    };

    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Move outside the screen to avoid scrolling
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            alert("Chave PIX copiada para a área de transferência!");
        } catch (err) {
            console.error('Fallback: Unable to copy', err);
            alert("Não foi possível copiar automaticamente. Por favor, selecione e copie manualmente.");
        }

        document.body.removeChild(textArea);
    };

    const handleExportReport = async () => {
        try {
            const now = new Date();
            // Start of current month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            // End of current month
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

            // 1. Fetch Manual Transactions created this month
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('group_id', groupId)
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth)
                .order('created_at', { ascending: false });

            if (txError) throw txError;

            // 2. Fetch Payments (Paid) this month
            // We use 'paid_at' to check when the money actually came in
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*, profiles:user_id(full_name)')
                .eq('group_id', groupId)
                .eq('status', 'PAGO')
                .gte('paid_at', startOfMonth)
                .lte('paid_at', endOfMonth);

            if (paymentsError) throw paymentsError;

            // Combine Data
            const reportData: any[] = [];

            if (txData) {
                txData.forEach(tx => {
                    reportData.push({
                        Data: new Date(tx.created_at).toLocaleDateString('pt-BR'),
                        Descricao: tx.description,
                        Categoria: tx.category,
                        Tipo: tx.type === 'income' ? 'Entrada' : 'Saída',
                        Valor: tx.amount,
                        Metodo: tx.payment_method || 'Outros'
                    });
                });
            }

            if (paymentsData) {
                paymentsData.forEach(pay => {
                    // Avoid duplicates if you track payments in transactions table too
                    // Assuming they are separate for now based on current logic
                    reportData.push({
                        Data: new Date(pay.paid_at).toLocaleDateString('pt-BR'),
                        Descricao: `Pagamento: ${pay.profiles?.full_name || 'Usuário'}`,
                        Categoria: pay.type === 'MENSAL' ? 'Mensalidade' : 'Partida',
                        Tipo: 'Entrada',
                        Valor: pay.amount,
                        Metodo: 'Plataforma'
                    });
                });
            }

            if (reportData.length === 0) {
                alert("Não há dados para exportar neste mês.");
                return;
            }

            // CSV Generation with BOM for Excel compatibility
            const bom = "\uFEFF";
            const headers = ["Data", "Descricao", "Categoria", "Tipo", "Valor", "Metodo"];
            const csvContent = [
                headers.join(";"), // Using semicolon for broader Excel support in regions like Brazil
                ...reportData.map(row =>
                    [
                        row.Data,
                        `"${row.Descricao.replace(/"/g, '""')}"`,
                        row.Categoria,
                        row.Tipo,
                        row.Valor.toString().replace('.', ','),
                        row.Metodo
                    ].join(";")
                )
            ].join("\n");

            const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `relatorio_financeiro_${now.getMonth() + 1}_${now.getFullYear()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error exporting report:", error);
            alert("Erro ao exportar relatório.");
        }
    };

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const handleWhatsAppCharge = (payment: any) => {
        const name = payment.profiles?.full_name?.split(' ')[0] || 'Jogador';
        const type = payment.type === 'MENSAL' ? 'mensalidade' : 'partida';
        const amount = formatMoney(payment.amount);

        let message = `Fala ${name}! ⚽\nLembrete amigável do pagamento da ${type} no valor de ${amount}.`;

        if (pixKey) {
            message += `\n\nChave PIX: ${pixKey}`;
        }

        message += `\n\nValeu!`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleChargeAll = () => {
        let message = `Fala Galera! ⚽\nQuem ainda não pagou, segue a chave PIX para regularizar.`;

        if (pixKey) {
            message += `\n\nChave PIX: ${pixKey}`;
        }

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    if (loading) {
        return <div className="p-8 text-center">Carregando financeiro...</div>;
    }

    return (
        <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 pb-12 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl md:text-3xl font-black tracking-tight text-[#0d1b12] dark:text-white">Financeiro do Grupo</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Visão geral do caixa, arrecadações e despesas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddExpenseModalOpen(true)}
                        className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">remove_circle</span>
                        Adicionar Despesa
                    </button>

                    <button onClick={handleExportReport} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-[#25382e] border border-gray-200 dark:border-[#2a4032] text-[#0d1b12] dark:text-white hover:bg-gray-50 dark:hover:bg-[#25382e]/80 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Exportar
                    </button>

                    <div className="flex items-center gap-1 bg-white dark:bg-[#1a2c20] p-1 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a4032]">
                        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-[#25382e] text-[#0d1b12] dark:text-white">Este Mês</button>
                        <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-[#25382e]/50 transition-colors">Total</button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex flex-col gap-8">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Saldo */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a4032] flex flex-col gap-4 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#13ec5b]/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="flex items-center gap-3 z-10">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Saldo em Caixa</span>
                        </div>
                        <div className="flex items-baseline gap-2 z-10">
                            <span className={`text-3xl md:text-4xl font-black ${balance >= 0 ? 'text-[#0d1b12] dark:text-white' : 'text-red-500'}`}>
                                {formatMoney(balance)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-500 z-10">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-xs">Atual</span>
                        </div>
                    </div>

                    {/* Entradas */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a4032] flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <span className="material-symbols-outlined">arrow_downward</span>
                            </div>
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Entradas (In)</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white">{formatMoney(income)}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#25382e] h-1.5 rounded-full mt-auto">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {/* Pendente - NEW CARD */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a4032] flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Pendente (Receber)</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-black text-amber-500">{formatMoney(totalPendingAmount)}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#25382e] h-1.5 rounded-full mt-auto">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: totalPendingAmount > 0 ? '100%' : '0' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Recent Transactions */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Transações Recentes</h3>
                        <Link href={`/dashboard/grupos/${groupId}/admin/financeiro/transacoes`} className="text-[#13ec5b] text-sm font-semibold flex items-center gap-1 hover:underline transition-all">
                            Ver tudo <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-[#1a2c20] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a4032] overflow-hidden">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Nenhuma transação encontrada.</div>
                        ) : (
                            transactions.map((tx: any) => (
                                <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors border-b border-gray-100 dark:border-[#2a4032] last:border-0">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                        <span className="material-symbols-outlined">{tx.type === 'income' ? 'add' : 'remove'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">{tx.description}</p>
                                        <p className="text-xs text-gray-500 capitalize">{tx.category} • {tx.payment_method || 'Outro'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-[#0d1b12] dark:text-gray-200'}`}>
                                            {tx.type === 'income' ? '+' : '-'} {formatMoney(tx.amount)}
                                        </p>
                                        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('pt-BR')} {new Date(tx.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Config & Pendings */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Configurações</h3>

                    {/* Pix Card */}
                    <div className="bg-gradient-to-br from-[#0d1b12] to-[#1a2c20] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#13ec5b] blur-[60px] opacity-20"></div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-[#13ec5b]">qr_code_2</span>
                            <h4 className="font-bold text-lg">Chave PIX do Grupo</h4>
                        </div>

                        {isEditingPix ? (
                            <div className="flex flex-col gap-3 mb-4">
                                <select
                                    value={newPixKeyType}
                                    onChange={(e) => setNewPixKeyType(e.target.value)}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#13ec5b]"
                                >
                                    <option value="email" className="text-black">E-mail</option>
                                    <option value="cpf" className="text-black">CPF</option>
                                    <option value="phone" className="text-black">Celular</option>
                                    <option value="random" className="text-black">Aleatória</option>
                                </select>
                                <input
                                    type="text"
                                    value={newPixKey}
                                    onChange={(e) => setNewPixKey(e.target.value)}
                                    placeholder="Digite a chave PIX"
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#13ec5b]"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setIsEditingPix(false)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm transition-colors">Cancelar</button>
                                    <button onClick={handleSavePix} className="flex-1 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] py-2 rounded-lg text-sm font-bold transition-colors">Salvar</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10 mb-4">
                                    <p className="text-xs text-gray-400 mb-1 capitalize">{pixKeyType || 'Chave'}</p>
                                    <p className="font-mono text-sm tracking-wide truncate">{pixKey || 'Nenhuma chave cadastrada'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleCopyPix} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        Copiar
                                    </button>
                                    <button onClick={() => setIsEditingPix(true)} className="flex-1 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] py-2 rounded-lg text-sm font-bold transition-colors">
                                        Editar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pending Payments */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a4032]">
                        <h4 className="font-bold text-[#0d1b12] dark:text-white mb-4">Pagamentos Pendentes</h4>
                        {pendingPayments.length === 0 ? (
                            <p className="text-sm text-gray-500">Nenhum pagamento pendente.</p>
                        ) : (
                            <ul className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
                                {pendingPayments.map((pp: any) => (
                                    <li key={pp.id} className="flex items-center justify-between text-sm group/item">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${pp.type === 'MENSAL' ? 'bg-purple-500' : 'bg-amber-500'}`}></div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-gray-600 dark:text-gray-300 truncate font-bold">{pp.profiles?.full_name || 'Jogador'}</span>
                                                <span className="text-[10px] text-gray-400">{pp.type === 'MENSAL' ? 'Mensalidade' : 'Partida'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-semibold text-[#0d1b12] dark:text-white">
                                                {formatMoney(pp.amount)}
                                            </span>

                                            <button
                                                onClick={() => handleWhatsAppCharge(pp)}
                                                className="opacity-0 group-hover/item:opacity-100 bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-all"
                                                title="Cobrar no WhatsApp"
                                            >
                                                <span className="material-symbols-outlined text-[16px] object-cover">chat</span>
                                            </button>

                                            <button
                                                onClick={() => handleMarkAsPaid(pp.id)}
                                                className="opacity-0 group-hover/item:opacity-100 bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-all"
                                                title="Confirmar Pagamento"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">check</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {pendingPayments.length > 0 && (
                            <button onClick={handleChargeAll} className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-[#0d1b12] dark:hover:text-white font-medium border border-gray-200 dark:border-[#2a4032] rounded-lg hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Cobrar Todos no WhatsApp
                            </button>
                        )}
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportReport}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#25382e] hover:border-[#13ec5b] hover:text-[#13ec5b] transition-all group cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-[#13ec5b] transition-colors">download</span>
                        <span className="font-medium">Exportar Relatório Mensal</span>
                    </button>
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
