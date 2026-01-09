"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../../src/lib/client";

export default function GroupFinancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    return (
        <div className="flex-1 flex flex-col h-full w-full max-w-6xl mx-auto px-4 md:px-0 pb-12">
            {/* Header */}
            <div className="py-6 md:py-8">
                <nav className="flex flex-wrap items-center gap-2 text-sm md:text-base mb-6">
                    <Link href="/dashboard" className="text-gray-400 hover:text-[#13ec5b] transition-colors font-medium">Dashboard</Link>
                    <span className="material-symbols-outlined text-gray-300 text-[16px]">chevron_right</span>
                    <Link href={`/dashboard/grupos/${groupId}`} className="text-gray-400 hover:text-[#13ec5b] transition-colors font-medium">Grupo</Link>
                    <span className="material-symbols-outlined text-gray-300 text-[16px]">chevron_right</span>
                    <span className="text-[#0d1b12] dark:text-white font-medium bg-white dark:bg-[#1a2c20] px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-[#2a4032]">Financeiro</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl md:text-3xl font-black tracking-tight text-[#0d1b12] dark:text-white">Financeiro do Grupo</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Visão geral do caixa, arrecadações e despesas.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-[#1a2c20] p-1 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a4032]">
                        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-[#25382e] text-[#0d1b12] dark:text-white">Este Mês</button>
                        <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-[#25382e]/50 transition-colors">Mês Passado</button>
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
                            <span className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white">R$ 540,00</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-500 z-10">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-xs">+12%</span>
                            <span className="text-gray-400">vs mês anterior</span>
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
                            <span className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white">R$ 1.250,00</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#25382e] h-1.5 rounded-full mt-auto">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>

                    {/* Saídas */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a4032] flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined">arrow_upward</span>
                            </div>
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Saídas (Out)</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white">R$ 710,00</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#25382e] h-1.5 rounded-full mt-auto">
                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Recent Transactions */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Transações Recentes</h3>
                            <button className="text-[#13ec5b] hover:text-[#0fd652] text-sm font-semibold flex items-center gap-1 transition-colors">
                                Ver tudo <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                        <div className="bg-white dark:bg-[#1a2c20] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a4032] overflow-hidden">
                            {/* Transaction Item 1 */}
                            <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors border-b border-gray-100 dark:border-[#2a4032] last:border-0">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <span className="material-symbols-outlined">add</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Pagamento Pelada #42</p>
                                    <p className="text-xs text-gray-500">João Silva • PIX</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">+ R$ 25,00</p>
                                    <p className="text-xs text-gray-400">Hoje, 10:30</p>
                                </div>
                            </div>

                            {/* Transaction Item 2 */}
                            <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors border-b border-gray-100 dark:border-[#2a4032] last:border-0">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <span className="material-symbols-outlined">add</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Pagamento Pelada #42</p>
                                    <p className="text-xs text-gray-500">Carlos Mendes • Dinheiro</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">+ R$ 25,00</p>
                                    <p className="text-xs text-gray-400">Hoje, 09:15</p>
                                </div>
                            </div>

                            {/* Transaction Item 3 */}
                            <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors border-b border-gray-100 dark:border-[#2a4032] last:border-0">
                                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0">
                                    <span className="material-symbols-outlined">remove</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Aluguel Quadra Society</p>
                                    <p className="text-xs text-gray-500">Arena Soccer • Cartão</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#0d1b12] dark:text-gray-200">- R$ 350,00</p>
                                    <p className="text-xs text-gray-400">Ontem</p>
                                </div>
                            </div>
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
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10 mb-4">
                                <p className="text-xs text-gray-400 mb-1">E-mail</p>
                                <p className="font-mono text-sm tracking-wide truncate">pagamentos@pelafacil.com.br</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    Copiar
                                </button>
                                <button className="flex-1 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] py-2 rounded-lg text-sm font-bold transition-colors">
                                    Editar
                                </button>
                            </div>
                        </div>

                        {/* Pending Payments */}
                        <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#2a4032]">
                            <h4 className="font-bold text-[#0d1b12] dark:text-white mb-4">Pagamentos Pendentes</h4>
                            <ul className="flex flex-col gap-3">
                                <li className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-gray-600 dark:text-gray-300">Lucas P.</span>
                                    </div>
                                    <span className="font-semibold text-[#0d1b12] dark:text-white">R$ 25,00</span>
                                </li>
                                <li className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-gray-600 dark:text-gray-300">Marcos V.</span>
                                    </div>
                                    <span className="font-semibold text-[#0d1b12] dark:text-white">R$ 25,00</span>
                                </li>
                                <li className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-gray-600 dark:text-gray-300">Felipe A.</span>
                                    </div>
                                    <span className="font-semibold text-[#0d1b12] dark:text-white">R$ 50,00</span>
                                </li>
                            </ul>
                            <button className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-[#0d1b12] dark:hover:text-white font-medium border border-gray-200 dark:border-[#2a4032] rounded-lg hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors">
                                Cobrar Todos
                            </button>
                        </div>

                        {/* Export Button */}
                        <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-[#13ec5b] hover:border-[#13ec5b] hover:bg-[#13ec5b]/5 transition-all group">
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">download</span>
                            <span className="font-medium">Exportar Relatório Mensal</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
