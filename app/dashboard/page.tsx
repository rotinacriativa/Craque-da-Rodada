"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/client";
import { formatDateForMatchList } from "../../src/lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const [nextMatch, setNextMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ organized: 0, participated: 0 });

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 2. Fetch Next Match (Only where I am a participant)
                // We use !inner to enforce the filter on the joined table to ensure I am playing
                const { data: matches } = await supabase
                    .from('matches')
                    .select('*, groups(name), match_participants!inner(user_id)')
                    .eq('match_participants.user_id', user.id)
                    .gte('date', new Date().toISOString().split('T')[0])
                    .order('date', { ascending: true })
                    .limit(1);

                if (matches && matches.length > 0) {
                    setNextMatch(matches[0]);
                } else {
                    setNextMatch(null);
                }

                // 3. Fetch Stats
                // Organized: Groups created by me
                const { count: groupsCreated } = await supabase
                    .from('groups')
                    .select('*', { count: 'exact', head: true })
                    .eq('created_by', user.id);

                setStats({
                    organized: groupsCreated || 0,
                    participated: 0
                });

            } catch (error) {
                console.error("Error loading dashboard home:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    const handleShare = async () => {
        const shareData = {
            title: 'Craque da Rodada',
            text: 'Bora organizar o jogo! Entra aí no Craque da Rodada.',
            url: window.location.origin,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copiado! Envie para seus amigos.');
            } catch (err) {
                alert('Copie este link: ' + shareData.url);
            }
        }
    };

    return (
        <>
            {/* Page Heading */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-[#0d1b12] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Bem-vindo de volta, <span className="text-[#13ec5b]">Jogador!</span>
                    </h3>
                    <p className="text-[#4c9a66] text-base font-normal leading-normal max-w-xl">
                        Aqui está o resumo dos seus jogos. Você tem convites pendentes e partidas confirmadas.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="text-xs font-bold text-[#4c9a66] uppercase tracking-wider mb-1 block">Sua Performance</span>
                    <div className="flex gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]"></div>
                        <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]"></div>
                        <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]/40"></div>
                        <div className="w-12 h-1.5 rounded-full bg-[#e7f3eb] dark:bg-[#2a4535]"></div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Card 1 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
                    <div className="flex justify-between items-start">
                        <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">Peladas Organizadas</p>
                        <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                            <span className="material-symbols-outlined text-xl">stadium</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">{loading ? '-' : stats.organized}</p>
                    </div>
                    <p className="text-xs text-[#8baaa0] mt-1">Total acumulado</p>
                </div>
                {/* Card 2 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
                    <div className="flex justify-between items-start">
                        <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">Partidas</p>
                        <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                            <span className="material-symbols-outlined text-xl">directions_run</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">0</p>
                    </div>
                    <p className="text-xs text-[#8baaa0] mt-1">Em breve</p>
                </div>
                {/* Card 3 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
                    <div className="flex justify-between items-start">
                        <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">Gols</p>
                        <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                            <span className="material-symbols-outlined text-xl">sports_soccer</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">0</p>
                    </div>
                    <p className="text-xs text-[#8baaa0] mt-1">Em breve</p>
                </div>
            </section>

            {/* Featured Card: Next Game */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[#0d1b12] dark:text-white text-xl font-bold">Próxima Pelada</h4>
                    <Link className="text-[#13ec5b] text-sm font-bold hover:underline" href="/dashboard/grupos">Ver agenda completa</Link>
                </div>

                {loading ? (
                    <div className="rounded-[2rem] bg-white dark:bg-[#1a2c20] p-10 text-center border border-[#e7f3eb]">
                        <span className="size-8 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin mx-auto"></span>
                    </div>
                ) : nextMatch ? (
                    <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-6 rounded-[2rem] bg-white dark:bg-[#1a2c20] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e7f3eb] dark:border-[#2a4535]">
                        {/* Card Image */}
                        <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-center bg-no-repeat bg-cover rounded-2xl md:rounded-3xl relative overflow-hidden group" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn1zLjEVJzzbfA6TQsi4mPWz6DPyZISrjM0oARG6tm3U10eaDmXgvuI2GeKtu4JeDz9JDEk-owaU-S7vJfd4sIzvuVbq7ayVwMnDDe-3flpSS5MSRFQh0NF_iQA8zsBmgzUMSvcsWVjM52PW6HwezkjqUIJm0WTiw7GcwK6tIPhcG6iLsbKByd886Zta5l-e6_GVFpQy_33J5uZ4z-sdbLRaR8dQjp-08S4aOYRmdiQB_QUUL1Sj6KeNbAa1T6L-lyQfMRCKjY-Rg')" }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                            <div className="absolute top-4 left-4 bg-[#13ec5b] text-[#0d1b12] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                Confirmado
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="material-symbols-outlined text-sm">cloud</span>
                                    <span className="text-xs font-medium">18°C • Sem chuva</span>
                                </div>
                            </div>
                        </div>
                        {/* Card Content */}
                        <div className="flex flex-1 flex-col gap-4 pt-4 md:pt-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[#13ec5b] text-sm font-bold uppercase tracking-wide">
                                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                                    {formatDateForMatchList(nextMatch.date, nextMatch.start_time)}
                                </div>
                                <h3 className="text-[#0d1b12] dark:text-white text-2xl md:text-3xl font-bold leading-tight">
                                    {nextMatch.name} - {nextMatch.groups?.name}
                                </h3>
                                <div className="flex items-center gap-2 text-[#4c9a66] text-sm md:text-base font-medium mt-1">
                                    <span className="material-symbols-outlined text-lg">location_on</span>
                                    {nextMatch.location}
                                </div>
                            </div>
                            {/* Players Avatars - Mocked for now */}
                            <div className="flex items-center gap-4 py-2 opacity-50">
                                <span className="text-xs italic">Participantes (Em breve)</span>
                            </div>
                            <div className="mt-auto flex gap-3 pt-4 border-t border-[#e7f3eb] dark:border-[#2a4535]">
                                <button
                                    onClick={() => router.push(`/dashboard/grupos/${nextMatch.group_id}`)}
                                    className="flex-1 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0fd651] transition-colors shadow-lg shadow-[#13ec5b]/20"
                                >
                                    <span className="truncate">Ver Detalhes da Pelada</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="cursor-pointer items-center justify-center overflow-hidden rounded-full size-12 bg-[#e7f3eb] dark:bg-[#22382b] text-[#0d1b12] dark:text-white hover:bg-[#d8ebe0] dark:hover:bg-[#2a4535] transition-colors flex"
                                >
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-[2.5rem] bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#13ec5b]"></div>
                        <div className="bg-[#13ec5b]/10 p-6 rounded-full mb-6">
                            <span className="material-symbols-outlined text-4xl text-[#0ea841] dark:text-[#13ec5b]">sports_soccer</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-[#0d1b12] dark:text-white mb-3 tracking-tight">
                            Bora organizar o jogo?
                        </h3>
                        <p className="text-[#4c9a66] dark:text-[#8baaa0] mb-8 max-w-md text-lg leading-relaxed">
                            Crie seu grupo, chame a galera e esqueça a planilha. O jeito mais fácil de gerenciar sua pelada.
                        </p>
                        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                            <Link
                                href="/dashboard/criar-grupo"
                                className="w-full h-14 rounded-full bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#13ec5b]/25 hover:scale-105"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Criar Nova Pelada
                            </Link>
                            <Link
                                href="/dashboard/explorar"
                                className="text-sm font-bold text-[#4c9a66] dark:text-[#8baaa0] hover:text-[#13ec5b] dark:hover:text-white transition-colors"
                            >
                                Ou procure uma pelada para jogar
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            {/* Quick Access / Secondary Content */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-lg text-[#0d1b12] dark:text-white">Atividade Recente</h4>
                        <button disabled className="text-[#4c9a66] opacity-50 cursor-not-allowed" title="Em breve">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-4 opacity-50">
                        {/* Mock items */}
                        <div className="flex items-center gap-4 pb-4 border-b border-[#f0f7f2] dark:border-[#2a4535] last:border-0 last:pb-0">
                            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">payments</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Pagamento Recebido</p>
                                <p className="text-xs text-[#4c9a66] truncate">Mensalidade de Outubro</p>
                            </div>
                            <span className="text-xs font-bold text-[#0d1b12] dark:text-white">R$ 30,00</span>
                        </div>
                    </div>
                </div>
                {/* Invite Banner */}
                <div className="bg-[#0d1b12] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-20 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-[180px] text-[#13ec5b]">mark_email_unread</span>
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-white font-bold text-xl mb-2">Convide seus amigos</h4>
                        <p className="text-[#8baaa0] text-sm mb-6 max-w-[200px]">Aumente a resenha! Traga seus amigos para organizar o jogo com você.</p>
                        <button
                            onClick={handleShare}
                            className="bg-[#13ec5b] text-[#0d1b12] font-bold py-3 px-6 rounded-full w-fit hover:bg-white transition-colors cursor-pointer"
                        >
                            Enviar Convite
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
