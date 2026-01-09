"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../../src/lib/client";

interface DashboardData {
    group: any;
    nextMatch: any;
    nextMatchParticipants: number;
    balance: number;
    activeMembersCount: number;
    totalMatchesCount: number;
    recentActivity: any[];
}

export default function GroupAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    const [data, setData] = useState<DashboardData>({
        group: null,
        nextMatch: null,
        nextMatchParticipants: 0,
        balance: 0,
        activeMembersCount: 0,
        totalMatchesCount: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

                // 1. Fetch Group
                const { data: groupData, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();
                if (groupError) throw groupError;

                // 2. Fetch Next Match (future date, or today + future time)
                // Simplified: Just order by date/time ascending where date >= today.
                const { data: matchesData } = await supabase
                    .from('matches')
                    .select('*, match_participants(count)')
                    .eq('group_id', groupId)
                    .gte('date', todayStr)
                    .order('date', { ascending: true })
                    .order('start_time', { ascending: true })
                    .limit(1);

                let nextMatch = null;
                let nextMatchParticipants = 0;

                if (matchesData && matchesData.length > 0) {
                    const match = matchesData[0];
                    // Check if it's strictly in the future (if date is today, check time)
                    const matchDateTime = new Date(`${match.date}T${match.start_time}`);
                    if (matchDateTime > now) {
                        nextMatch = match;
                        nextMatchParticipants = match.match_participants?.[0]?.count || 0;
                    }
                }

                // 3. Stats: Members
                const { count: membersCount } = await supabase
                    .from('group_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', groupId)
                    .eq('status', 'active');

                // 4. Stats: Matches History (past)
                const { count: matchesCount } = await supabase
                    .from('matches')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', groupId)
                    .lt('date', todayStr);

                // 5. Balance (Transactions)
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount, type, description, created_at, category')
                    .eq('group_id', groupId)
                    .order('created_at', { ascending: false });

                let balance = 0;
                let activity: any[] = [];

                if (transactions) {
                    transactions.forEach((tx: any) => {
                        if (tx.type === 'income') balance += Number(tx.amount);
                        else balance -= Number(tx.amount);
                    });
                    // Use transactions as recent activity for now
                    activity = transactions.slice(0, 3);
                }

                setData({
                    group: groupData,
                    nextMatch,
                    nextMatchParticipants,
                    activeMembersCount: membersCount || 0,
                    totalMatchesCount: matchesCount || 0,
                    balance,
                    recentActivity: activity
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        if (groupId) fetchDashboardData();
    }, [groupId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
            </div>
        );
    }

    if (!data.group) return <div>Grupo não encontrado.</div>;

    // Helpers
    const formatMoney = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return { day: '--', month: '---', weekday: '---' };
        const d = new Date(dateStr);
        // Offset for timezone if needed, but local string usually works better if handled correctly. 
        // We'll treat dateStr (YYYY-MM-DD) as UTC or local noon to avoid midnight shift issues, 
        // or just use split.
        const [year, month, day] = dateStr.split('-');
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));

        return {
            day: day,
            month: dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(), // SEPT
            weekday: dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }), // Terça-feira
        };
    };

    const nextMatchDate = data.nextMatch ? formatDate(data.nextMatch.date) : null;

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-8">
            {/* Page Heading & Status */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#13ec5b] text-[#102216] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Administrador</span>
                        <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Grupo Ativo
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1b12] dark:text-white">{data.group.name}</h2>
                    <p className="text-[#4c9a66] text-sm md:text-base font-normal max-w-xl">Gerencie seus jogos, membros e financeiro em um só lugar.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#e7f3eb] dark:border-[#2a4032] bg-white dark:bg-[#1a2c20] text-[#0d1b12] dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        Convidar
                    </button>
                    <Link href={`/dashboard/grupos/${groupId}/nova-partida`} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d1b12] dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nova Partida
                    </Link>
                </div>
            </div>

            {/* Next Match Hero Section */}
            {data.nextMatch ? (
                <div className="bg-white dark:bg-[#1a2c20] rounded-2xl p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#2a4032] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#13ec5b]/10 dark:bg-[#13ec5b]/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                        {/* Left: Date & Time Visual */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#f6f8f6] dark:bg-[#102216] rounded-xl p-6 min-w-[140px] border border-[#e7f3eb] dark:border-[#2a4032]">
                            <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-widest">{nextMatchDate?.month.slice(0, 3)}</span>
                            <span className="text-5xl font-black text-[#0d1b12] dark:text-white my-1">{nextMatchDate?.day}</span>
                            <span className="text-lg font-medium text-[#0d1b12] dark:text-gray-300 capitalize">{nextMatchDate?.weekday.split('-')[0]}</span>
                            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-3"></div>
                            <div className="flex items-center gap-1.5 text-[#0d1b12] dark:text-[#13ec5b] font-bold">
                                <span className="material-symbols-outlined text-[20px]">schedule</span>
                                <span>{data.nextMatch.start_time.slice(0, 5)}</span>
                            </div>
                        </div>
                        {/* Middle: Info & Progress */}
                        <div className="flex-1 flex flex-col justify-center gap-5">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold">Próximo Jogo</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#0d1b12] dark:text-white mb-1">{data.nextMatch.name}</h3>
                                <div className="flex items-center gap-2 text-[#4c9a66] text-sm">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{data.nextMatch.location}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end text-sm">
                                    <span className="font-medium text-[#0d1b12] dark:text-gray-300">Lista de Presença</span>
                                    <span className="font-bold text-[#13ec5b]">{data.nextMatchParticipants} <span className="text-[#4c9a66] font-normal">/ {data.nextMatch.capacity} vagas</span></span>
                                </div>
                                <div className="w-full bg-[#e7f3eb] dark:bg-[#102216] rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-[#13ec5b] h-full rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)] transition-all duration-500"
                                        style={{ width: `${Math.min(100, (data.nextMatchParticipants / (data.nextMatch.capacity || 20)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        {/* Right: Actions */}
                        <div className="flex flex-col justify-end lg:items-end gap-3 border-t lg:border-t-0 lg:border-l border-[#e7f3eb] dark:border-[#2a4032] pt-4 lg:pt-0 lg:pl-8">
                            <Link href={`/dashboard/grupos/${groupId}/partidas/${data.nextMatch.id}`} className="w-full lg:w-auto px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#102216] text-sm font-bold rounded-full transition-all shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
                                Gerenciar Partida
                            </Link>
                            <button className="w-full lg:w-auto px-6 py-3 bg-transparent border border-[#e7f3eb] dark:border-[#2a4032] hover:bg-gray-50 dark:hover:bg-[#25382e] text-[#0d1b12] dark:text-white text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">groups</span>
                                Gerar Times
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a2c20] rounded-2xl p-8 shadow-sm border border-[#e7f3eb] dark:border-[#2a4032] flex flex-col items-center justify-center text-center py-12">
                    <div className="bg-[#f6f8f6] dark:bg-[#102216] p-4 rounded-full mb-4">
                        <span className="material-symbols-outlined text-4xl text-[#4c9a66]">event_busy</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white mb-2">Nenhuma partida agendada</h3>
                    <p className="text-[#4c9a66] mb-6">Crie uma nova partida para começar a organizar.</p>
                    <Link href={`/dashboard/grupos/${groupId}/nova-partida`} className="bg-[#13ec5b] hover:bg-[#0fd650] text-[#102216] font-bold px-6 py-3 rounded-full shadow-lg shadow-[#13ec5b]/20 transition-all">
                        Criar Nova Partida
                    </Link>
                </div>
            )}

            {/* Shortcut Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Financeiro Card */}
                <Link href={`/dashboard/grupos/${groupId}/admin/financeiro`} className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">account_balance_wallet</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Caixa do Grupo</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{formatMoney(data.balance)}</h4>
                        {/* Placeholder trend for now, or calculate if we have history */}
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                            {/* <span className="material-symbols-outlined text-[14px]">trending_up</span>
                           <span>+15% este mês</span> */}
                        </div>
                    </div>
                </Link>
                {/* Membros Card */}
                <Link href={`/dashboard/grupos/${groupId}/admin/jogadores`} className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">groups</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Membros Ativos</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{data.activeMembersCount} Atletas</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4c9a66]">
                            {/* Placeholder */}
                        </div>
                    </div>
                </Link>
                {/* Partidas Card */}
                <Link href={`/dashboard/grupos/${groupId}/admin/partidas`} className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">history</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Histórico</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{data.totalMatchesCount} Jogos</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4c9a66]">
                            <span>Ver todas as partidas</span>
                        </div>
                    </div>
                </Link>
                {/* Times Card - Placeholder for now */}
                <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-700 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">shuffle</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Ferramentas</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">Sorteador</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4c9a66]">
                            <span>Criar times equilibrados</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white">Últimas Atividades Financeiras</h3>
                    <Link href={`/dashboard/grupos/${groupId}/admin/financeiro`} className="text-[#13ec5b] text-sm font-bold hover:underline">Ver tudo</Link>
                </div>
                <div className="bg-white dark:bg-[#1a2c20] rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] overflow-hidden">
                    {data.recentActivity.length === 0 ? (
                        <div className="p-8 text-center text-[#4c9a66]">
                            Nenhuma atividade recente registrada.
                        </div>
                    ) : (
                        data.recentActivity.map((activity, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between border-b border-[#e7f3eb] dark:border-[#2a4032] hover:bg-[#f6f8f6] dark:hover:bg-[#102216]/50 transition-colors last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full flex items-center justify-center ${activity.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                        <span className="material-symbols-outlined text-[20px]">{activity.category === 'payment' ? 'payments' : 'attach_money'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0d1b12] dark:text-white capitalize">{activity.category || activity.type}</p>
                                        <p className="text-xs text-[#4c9a66]">{activity.description}</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-bold ${activity.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {activity.type === 'income' ? '+' : '-'} {formatMoney(Number(activity.amount))}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
