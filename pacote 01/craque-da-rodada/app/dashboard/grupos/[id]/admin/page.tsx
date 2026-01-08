"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../../src/lib/supabaseClient";

export default function GroupAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroup() {
            try {
                const { data, error } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();

                if (data) setGroup(data);
            } catch (error) {
                console.error("Error fetching group:", error);
            } finally {
                setLoading(false);
            }
        }
        if (groupId) fetchGroup();
    }, [groupId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
            </div>
        );
    }

    if (!group) return <div>Grupo não encontrado.</div>;

    return (
        <div className="flex flex-col gap-8">
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1b12] dark:text-white">{group.name}</h2>
                    <p className="text-[#4c9a66] text-sm md:text-base font-normal max-w-xl">Gerencie seus jogos, membros e financeiro em um só lugar. O próximo jogo está chegando!</p>
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
            <div className="bg-white dark:bg-[#1a2c20] rounded-2xl p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#2a4032] relative overflow-hidden group">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#13ec5b]/10 dark:bg-[#13ec5b]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                    {/* Left: Date & Time Visual */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#f6f8f6] dark:bg-[#102216] rounded-xl p-6 min-w-[140px] border border-[#e7f3eb] dark:border-[#2a4032]">
                        <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-widest">AGO</span>
                        <span className="text-5xl font-black text-[#0d1b12] dark:text-white my-1">24</span>
                        <span className="text-lg font-medium text-[#0d1b12] dark:text-gray-300">Terça</span>
                        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-3"></div>
                        <div className="flex items-center gap-1.5 text-[#0d1b12] dark:text-[#13ec5b] font-bold">
                            <span className="material-symbols-outlined text-[20px]">schedule</span>
                            <span>20:00</span>
                        </div>
                    </div>
                    {/* Middle: Info & Progress */}
                    <div className="flex-1 flex flex-col justify-center gap-5">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold">Confirmando Presença</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#0d1b12] dark:text-white mb-1">Futebol Society - Rodada 42</h3>
                            <div className="flex items-center gap-2 text-[#4c9a66] text-sm">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                <span>Arena Soccer, Campo 3 - São Paulo</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-medium text-[#0d1b12] dark:text-gray-300">Lista de Presença</span>
                                <span className="font-bold text-[#13ec5b]">14 <span className="text-[#4c9a66] font-normal">/ 22 vagas</span></span>
                            </div>
                            <div className="w-full bg-[#e7f3eb] dark:bg-[#102216] rounded-full h-3 overflow-hidden">
                                <div className="bg-[#13ec5b] h-full rounded-full w-[63%] shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden py-1">
                                <img alt="Member Avatar" className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#1c3024]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDKeXD-7Rq8nS3_8oKAX46nwCvSf6JLCqddicnFz5Zgyp-LHwcXnNDAY_pjV_pJwJhBnit_s4JY4rrhnb5WP65GCPHaCTedIZzMdv9WlFxgdLsofUM_KETyjroshuYNgOrS1LjNKGK5z9Uqca3zX8YDy1-UANVRneX0TAocG3W5QcQKu9wnQo9HICFoL-zx82ZzhGb_09s11fXwRrwCyZ3lCFOuSTpBVLdnHikCUsDpo9brtnEAug2bKInClf1hKQOhNvGzXVXqO8" />
                                <img alt="Member Avatar" className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#1c3024]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqeNGsu5T0CCAl8ksxIs5Kfns0UGodHPQySOKdhX73jtQwck8TmyTU2LzM_tOhfmjs44bLWeFFRrztLFZ6TOlqtsiylig9WXyQ2n-7BGKS3XAfteUoKlKTFeMweJVbS3HonntO0bVtIXF40KXvVGilNSqmbq4VCzRFodJUdK4y4PWvCYmWwxyLJp80S6Z_S_XTDbacOVQqS6OMdi-rHP6HOfmZmB1HkJI5uyH8CsgnJ7SSkbNXiLwK6dSzrJ_43uoKV2jRMUkXAJs" />
                                <img alt="Member Avatar" className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#1c3024]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCITLKeEwgBKRKHpyRGojJ4gxlYMBNyaJPfvk92ECU4O13HnFJZC-DhFP8Faagyk1mgMSJeSI0J6dbG26RyvdJvbWvX5qzVeFT_NlhHqEvXyNvHakQIx5nIE63WxGFRFu19DwUSetBo7OqH3samCwrTfU_42hBvMKp9Iv0h6E9evRgGIBM-zsjHYge9GKG7Bu_47mdX7fS8wrepnJgwfkUWFxlpJbgzNuBiRzwXgsuUUYyGU8-k2vK31dXdv0ZZe6t219R2Kl3W2AA" />
                                <img alt="Member Avatar" className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#1c3024]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQU66RmSaKo0WnmbOOR4WKATmAhM-Zxn0VxScRLSTy3NCHv0M2B8TnGcIryYMRYteoYT9k-KrnoSaecZTPouwb0z6sVdCEmuwe-e0Anq_AzHGJUfQ_IS8-hUgbptbQOSFeyISp9eseqWWTGp4JxjwF81DqEEz1mrHw2mpM8rppLXXCPxTfb_dyRllkv6dQThp91wHyMR5XBaHVspDTP1Qi_eeoZqk-GXHAUcye_yN5RLVzAtawbpV7ZP76VLQKyAS13Vyh73PWkaA" />
                                <div className="flex items-center justify-center size-8 rounded-full ring-2 ring-white dark:ring-[#1c3024] bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-[#4c9a66]">+10</div>
                            </div>
                        </div>
                    </div>
                    {/* Right: Actions */}
                    <div className="flex flex-col justify-end lg:items-end gap-3 border-t lg:border-t-0 lg:border-l border-[#e7f3eb] dark:border-[#2a4032] pt-4 lg:pt-0 lg:pl-8">
                        <Link href={`/dashboard/grupos/${groupId}/partidas/gerenciar`} className="w-full lg:w-auto px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#102216] text-sm font-bold rounded-full transition-all shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2">
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

            {/* Shortcut Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Financeiro Card */}
                <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">account_balance_wallet</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Caixa do Grupo</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">R$ 450,00</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            <span>+15% este mês</span>
                        </div>
                    </div>
                </div>
                {/* Membros Card */}
                <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">groups</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Membros Ativos</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">35 Atletas</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4c9a66]">
                            <span>2 novos esta semana</span>
                        </div>
                    </div>
                </div>
                {/* Partidas Card */}
                <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined icon-filled">history</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">arrow_outward</span>
                    </div>
                    <div>
                        <p className="text-[#4c9a66] text-sm font-medium mb-1">Histórico</p>
                        <h4 className="text-2xl font-bold text-[#0d1b12] dark:text-white tracking-tight">42 Jogos</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#4c9a66]">
                            <span>Ver todas as partidas</span>
                        </div>
                    </div>
                </div>
                {/* Times Card */}
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
                    <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white">Últimas Atividades</h3>
                    <button className="text-[#13ec5b] text-sm font-bold hover:underline">Ver tudo</button>
                </div>
                <div className="bg-white dark:bg-[#1a2c20] rounded-2xl border border-[#e7f3eb] dark:border-[#2a4032] overflow-hidden">
                    {/* List Item 1 */}
                    <div className="p-4 flex items-center justify-between border-b border-[#e7f3eb] dark:border-[#2a4032] hover:bg-[#f6f8f6] dark:hover:bg-[#102216]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400">
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white">Pagamento Recebido</p>
                                <p className="text-xs text-[#4c9a66]">João Silva pagou a mensalidade de Agosto</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">+ R$ 50,00</span>
                    </div>
                    {/* List Item 2 */}
                    <div className="p-4 flex items-center justify-between border-b border-[#e7f3eb] dark:border-[#2a4032] hover:bg-[#f6f8f6] dark:hover:bg-[#102216]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400">
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white">Novo Membro</p>
                                <p className="text-xs text-[#4c9a66]">Lucas Oliveira entrou no grupo</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-[#4c9a66]">Há 2 horas</span>
                    </div>
                    {/* List Item 3 */}
                    <div className="p-4 flex items-center justify-between hover:bg-[#f6f8f6] dark:hover:bg-[#102216]/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400">
                                <span className="material-symbols-outlined text-[20px]">person_remove</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white">Baixa na Presença</p>
                                <p className="text-xs text-[#4c9a66]">Felipe Santos saiu do jogo de Terça</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-[#4c9a66]">Há 5 horas</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
