"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlayerStat, SortMode } from "@/src/lib/types/player";
import Image from "next/image";

interface RankingViewProps {
    players: PlayerStat[];
    groups: { id: string; name: string }[];
    currentGroupId?: string;
    recentMatches?: any[];
    nextMatch?: any;
}

export default function RankingView({ players, groups, currentGroupId, recentMatches = [], nextMatch }: RankingViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sortMode, setSortMode] = useState<SortMode>(searchParams.get('sort') as SortMode || 'goals');

    // Stats Calculation
    const totalGols = players.reduce((sum, p) => sum + (p.goals || 0), 0);
    const totalAssists = players.reduce((sum, p) => sum + (p.assists || 0), 0);
    const jogadoresAtivos = players.length;
    // Estimate unique matches (simplified)
    const totalPartidas = Math.max(...players.map(p => Number(p.matches_played) || 0), 0);
    const mediaGols = totalPartidas > 0 ? (totalGols / totalPartidas).toFixed(1) : "0";

    const handleGroupChange = (groupId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (groupId === 'all') {
            params.delete('groupId');
        } else {
            params.set('groupId', groupId);
        }
        router.push(`/dashboard/ranking?${params.toString()}`);
    };

    const sortedPlayers = [...players].sort((a, b) => {
        if (sortMode === 'score') return (b.total_score || 0) - (a.total_score || 0) || b.goals - a.goals;
        if (sortMode === 'goals') return b.goals - a.goals || b.assists - a.assists;
        if (sortMode === 'assists') return b.assists - a.assists || b.goals - a.goals;
        if (sortMode === 'rating') return b.avg_rating - a.avg_rating || b.goals - a.goals;
        return 0;
    });

    const top3 = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto py-2">
            {/* Page Heading & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                        <span className="material-symbols-outlined text-lg">analytics</span>
                        <span>Dashboard</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                        Estatísticas da Temporada
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                        Acompanhe o desempenho dos artilheiros, assiduidade e o histórico completo das partidas do seu grupo.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={currentGroupId || 'all'}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            className="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer outline-none shadow-sm"
                        >
                            <option value="all">Todos os Grupos</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">calendar_month</span>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>

                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-xl">share</span>
                        <span className="font-bold text-sm">Compartilhar</span>
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="sports_soccer"
                    label="Total de Gols"
                    value={totalGols.toString()}
                    trend="+12%"
                    colorClass="text-primary"
                    bgClass="bg-blue-50 dark:bg-blue-900/30"
                />
                <StatCard
                    icon="stadium"
                    label="Partidas Jogadas"
                    value={totalPartidas.toString()}
                    colorClass="text-orange-500"
                    bgClass="bg-orange-50 dark:bg-orange-900/30"
                />
                <StatCard
                    icon="analytics"
                    label="Média Gols/Jogo"
                    value={mediaGols}
                    colorClass="text-purple-500"
                    bgClass="bg-purple-50 dark:bg-purple-900/30"
                />
                <StatCard
                    icon="groups"
                    label="Jogadores Ativos"
                    value={jogadoresAtivos.toString()}
                    trend="+2"
                    colorClass="text-emerald-500"
                    bgClass="bg-emerald-50 dark:bg-emerald-900/30"
                />
            </div>

            {/* Main Grid: Ranking & History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Col: Rankings (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Ranking de Artilharia</h2>
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex text-sm font-medium shadow-inner">
                            <button
                                onClick={() => setSortMode('goals')}
                                className={`px-4 py-1.5 rounded-full transition-all ${sortMode === 'goals' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
                            >Gols</button>
                            <button
                                onClick={() => setSortMode('score')}
                                className={`px-4 py-1.5 rounded-full transition-all ${sortMode === 'score' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
                            >Pontos</button>
                            <button
                                onClick={() => setSortMode('assists')}
                                className={`px-4 py-1.5 rounded-full transition-all ${sortMode === 'assists' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
                            >Assists</button>
                        </div>
                    </div>

                    {players.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 font-light">sports_soccer</span>
                            <p className="text-slate-500 font-medium font-display">Nenhuma estatística disponível ainda.</p>
                        </div>
                    ) : (
                        <>
                            {/* Podium */}
                            <div className="flex flex-col sm:flex-row gap-4 items-end justify-center py-10 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-900/10 rounded-3xl border border-slate-100/50 dark:border-slate-800/50">
                                {/* 2nd Place */}
                                {top3[1] && (
                                    <PodiumItem
                                        player={top3[1]}
                                        rank={2}
                                        stat={sortMode === 'goals' ? `${top3[1].goals} Gols` : sortMode === 'score' ? `${top3[1].total_score} Pts` : `${top3[1].assists} Assists`}
                                        borderColor="border-slate-300 dark:border-slate-600"
                                        rankBg="bg-slate-300"
                                        podiumBg="bg-slate-200 dark:bg-slate-700"
                                        podiumGradient="from-slate-300/50"
                                        height="h-24"
                                    />
                                )}

                                {/* 1st Place */}
                                {top3[0] && (
                                    <PodiumItem
                                        player={top3[0]}
                                        rank={1}
                                        stat={sortMode === 'goals' ? `${top3[0].goals} Gols` : sortMode === 'score' ? `${top3[0].total_score} Pts` : `${top3[0].assists} Assists`}
                                        borderColor="border-yellow-400"
                                        rankBg="bg-yellow-400"
                                        podiumBg="bg-yellow-100 dark:bg-yellow-900/30"
                                        podiumGradient="from-yellow-400/20"
                                        height="h-32"
                                        isWinner
                                    />
                                )}

                                {/* 3rd Place */}
                                {top3[2] && (
                                    <PodiumItem
                                        player={top3[2]}
                                        rank={3}
                                        stat={sortMode === 'goals' ? `${top3[2].goals} Gols` : sortMode === 'score' ? `${top3[2].total_score} Pts` : `${top3[2].assists} Assists`}
                                        borderColor="border-orange-300 dark:border-orange-800"
                                        rankBg="bg-orange-300"
                                        podiumBg="bg-orange-100 dark:bg-orange-900/20"
                                        podiumGradient="from-orange-300/30"
                                        height="h-16"
                                    />
                                )}
                            </div>

                            {/* Ranking List */}
                            <div className="flex flex-col gap-3">
                                {rest.map((player, index) => (
                                    <RankingRow
                                        key={player.user_id}
                                        player={player}
                                        rank={index + 4}
                                        sortMode={sortMode}
                                    />
                                ))}
                            </div>

                            <button className="w-full py-4 text-center text-primary font-bold text-sm hover:underline mt-2">
                                Ver Ranking Completo
                            </button>
                        </>
                    )}
                </div>

                {/* Right Col: Match History (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Últimas Partidas</h2>
                        <button className="text-primary text-sm font-bold hover:underline">Ver todas</button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {recentMatches.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400">
                                Nenhuma partida finalizada recentemente.
                            </div>
                        ) : (
                            recentMatches.map(match => (
                                <MatchHistoryCard key={match.id} match={match} />
                            ))
                        )}

                        {/* Upcoming Match Card */}
                        {nextMatch ? (
                            <NextMatchPremiumCard nextMatch={nextMatch} />
                        ) : (
                            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-8 rounded-2xl text-center text-slate-500">
                                Nenhuma pelada agendada no momento.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sub-components

function StatCard({ icon, label, value, trend, colorClass, bgClass }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3 group hover:border-primary/50 transition-all hover:shadow-md cursor-default">
            <div className="flex justify-between items-start">
                <div className={`p-2.5 ${bgClass} ${colorClass} rounded-xl`}>
                    <span className="material-symbols-outlined text-2xl font-light">{icon}</span>
                </div>
                {trend && (
                    <span className="flex items-center text-[10px] font-black text-green-500 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full tracking-wider uppercase">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-tight">{label}</p>
                <p className="text-3xl font-black mt-1 group-hover:text-primary transition-colors font-display tracking-tight text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function PodiumItem({ player, rank, stat, borderColor, rankBg, podiumBg, podiumGradient, height, isWinner }: any) {
    return (
        <div className={`flex-1 flex flex-col items-center gap-3 ${isWinner ? 'order-1 sm:order-2 z-10' : rank === 2 ? 'order-2 sm:order-1' : 'order-3'}`}>
            {isWinner && <span className="material-symbols-outlined text-yellow-500 text-4xl animate-bounce mb-[-10px]">emoji_events</span>}
            <div className="relative">
                <div
                    className={`${isWinner ? 'size-28 font-bold' : 'size-20'} rounded-full border-4 ${borderColor} bg-cover bg-center shadow-xl w-full h-full aspect-square`}
                    style={{ backgroundImage: `url('${player.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.full_name}')` }}
                ></div>
                <div className={`absolute ${isWinner ? '-bottom-4 text-sm px-3 py-1' : '-bottom-3 text-xs px-2 py-0.5'} left-1/2 -translate-x-1/2 ${rankBg} ${rank === 1 ? 'text-yellow-950 font-black' : 'text-slate-800 font-bold'} rounded-full shadow-md`}>
                    #{rank}
                </div>
            </div>
            <div className="text-center mt-2 px-2">
                <p className={`font-black ${isWinner ? 'text-xl' : 'text-lg'} leading-tight line-clamp-1`}>{player.full_name.split(' ')[0]}</p>
                <p className={`${isWinner ? 'text-primary font-bold' : 'text-slate-500 font-medium'} text-sm mt-1 uppercase tracking-wider`}>{stat}</p>
            </div>
            <div className={`w-full ${height} ${podiumBg} rounded-t-2xl mt-2 relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-t ${podiumGradient} to-transparent opacity-50`}></div>
            </div>
        </div>
    );
}

function RankingRow({ player, rank, sortMode }: any) {
    const value = sortMode === 'goals' ? player.goals : sortMode === 'score' ? player.total_score : player.assists;
    const label = sortMode === 'goals' ? 'gols' : sortMode === 'score' ? 'pts' : 'assists';

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex items-center gap-4">
                <span className="text-slate-300 font-black w-6 text-center text-lg italic transition-colors group-hover:text-primary">{rank}</span>
                <div
                    className="size-11 rounded-full bg-slate-200 bg-cover bg-center shadow-sm"
                    style={{ backgroundImage: `url('${player.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.full_name}')` }}
                ></div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{player.full_name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{player.position || 'Jogador'}</p>
                </div>
            </div>
            <div className="text-right bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl group-hover:bg-primary/5 transition-colors">
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none font-display">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{label}</p>
            </div>
        </div>
    );
}

function MatchHistoryCard({ match }: any) {
    const date = new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-black tracking-wider uppercase">FINALIZADO</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="size-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-300 font-black text-2xl shadow-inner border border-blue-200/50 dark:border-blue-700/50">
                        A
                    </div>
                </div>

                <div className="flex flex-col items-center px-4">
                    <div className="flex items-center gap-5 text-4xl font-black text-slate-900 dark:text-white font-display">
                        <span>{match.score_a || 0}</span>
                        <span className="text-slate-200 dark:text-slate-700 text-2xl italic">vs</span>
                        <span>{match.score_b || 0}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="size-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                        B
                    </div>
                </div>
            </div>

            {/* MVP Section - simplified as we might not have it computed yet */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold tracking-tight">
                <span className="material-symbols-outlined text-base text-yellow-500 filled">stars</span>
                <span>Partida emocionante de alto nível! ⚽🔥</span>
            </div>
        </div>
    );
}

function NextMatchPremiumCard({ nextMatch }: any) {
    const dateFormatted = new Date(nextMatch.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();

    return (
        <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">PRÓXIMA PELADA • {dateFormatted}</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-black backdrop-blur-md border border-white/20">
                    {nextMatch.start_time?.slice(0, 5)}H
                </span>
            </div>

            <div className="flex items-center gap-5 relative z-10">
                <div className="bg-white/20 p-4 rounded-[1.25rem] backdrop-blur-md border border-white/30 shadow-inner">
                    <span className="material-symbols-outlined text-3xl font-light">location_on</span>
                </div>
                <div>
                    <p className="font-black text-2xl tracking-tight leading-tight">{nextMatch.location || 'Local a definir'}</p>
                    <p className="text-blue-100/80 text-sm font-medium mt-1 truncate max-w-[200px]">Partiu bater aquela bola? ⚽</p>
                </div>
            </div>

            <button className="w-full mt-7 bg-white text-primary font-black py-4 rounded-full hover:bg-white/90 transition-all shadow-lg active:scale-95 relative z-10 text-sm uppercase tracking-wider">
                Confirmar Presença
            </button>
        </div>
    );
}
