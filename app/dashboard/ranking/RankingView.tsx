"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlayerStat, SortMode } from "@/src/lib/types/player";



interface RankingViewProps {
    players: PlayerStat[];
    groups: { id: string; name: string }[];
    currentGroupId?: string;
}



export default function RankingView({ players, groups, currentGroupId }: RankingViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sortMode, setSortMode] = useState<SortMode>('goals');

    // Filter Logic Handling (Server-side trigger)
    const handleGroupChange = (groupId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (groupId === 'all') {
            params.delete('groupId');
        } else {
            params.set('groupId', groupId);
        }
        router.push(`/dashboard/ranking?${params.toString()}`);
    };

    // Sorting Logic (Client-side)
    const sortedPlayers = [...players].sort((a, b) => {
        if (sortMode === 'goals') return b.goals - a.goals || b.avg_rating - a.avg_rating;
        if (sortMode === 'assists') return b.assists - a.assists || b.matches_played - a.matches_played;
        if (sortMode === 'rating') return b.avg_rating - a.avg_rating || b.goals - a.goals;
        return 0;
    });

    const top3 = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Ranking de Jogadores</h2>
                    <p className="text-sm text-[#4c9a66] dark:text-gray-400">Acompanhe quem está mandando bem na temporada.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a2c20] px-4 py-2 rounded-full border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                    <span>Temporada 2026</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={currentGroupId || 'all'}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] rounded-lg text-sm font-medium hover:border-[#13ec5b] transition-colors text-[#0d1b12] dark:text-white shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-[#13ec5b]/50"
                        >
                            <option value="all">Todos os Grupos</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#13ec5b] text-lg pointer-events-none">groups</span>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">expand_more</span>
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSortMode('goals')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${sortMode === 'goals' ? 'bg-[#13ec5b]/20 text-[#0ea841] dark:text-[#13ec5b]' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2a4535]'}`}
                    >
                        Artilheiros
                    </button>
                    <button
                        onClick={() => setSortMode('assists')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${sortMode === 'assists' ? 'bg-[#13ec5b]/20 text-[#0ea841] dark:text-[#13ec5b]' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2a4535]'}`}
                    >
                        Assistências
                    </button>
                    <button
                        onClick={() => setSortMode('rating')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${sortMode === 'rating' ? 'bg-[#13ec5b]/20 text-[#0ea841] dark:text-[#13ec5b]' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2a4535]'}`}
                    >
                        Nota Média
                    </button>
                </div>
            </div>

            {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2c20] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">sports_soccer</span>
                    <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Nenhum jogador classificado</h3>
                    <p className="text-gray-400">Jogue partidas para gerar estatísticas!</p>
                </div>
            ) : (
                <>
                    {/* Podium */}
                    {top3.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end max-w-5xl mx-auto w-full pt-8">
                            {/* 2nd Place */}
                            {top3[1] && <PodiumCard player={top3[1]} rank={2} sortMode={sortMode} />}

                            {/* 1st Place */}
                            {top3[0] && <PodiumCard player={top3[0]} rank={1} sortMode={sortMode} isWinner />}

                            {/* 3rd Place */}
                            {top3[2] && <PodiumCard player={top3[2]} rank={3} sortMode={sortMode} />}
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-[#1a2c20] rounded-xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] overflow-hidden">
                        <div className="p-6 border-b border-[#e7f3eb] dark:border-[#2a4535] flex justify-between items-center bg-gray-50/50 dark:bg-[#22382b]/30">
                            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Classificação Geral</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#22382b]/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-[#e7f3eb] dark:border-[#2a4535]">
                                        <th className="px-6 py-4 text-center w-16">#</th>
                                        <th className="px-6 py-4">Jogador</th>
                                        <th className="px-6 py-4 text-center">Partidas</th>
                                        <th className="px-6 py-4 text-center">Gols</th>
                                        <th className="px-6 py-4 text-center">Assist.</th>
                                        <th className="px-6 py-4 text-center">Vencidas</th>
                                        <th className="px-6 py-4 text-center">Nota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7f3eb] dark:divide-[#2a4535] text-sm">
                                    {/* If top 3 are also shown in table, logic is simple. Usually podium players are excluded or highlighted. Let's include all but highlight top 3 if wanted. For now, showing REST of table if large, or ALL? Requirement implies full table. Let's show ALL sorted.*/}
                                    {sortedPlayers.map((player, index) => (
                                        <tr key={player.user_id} className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                            <td className={`px-6 py-4 text-center font-bold ${index < 3 ? 'text-[#13ec5b]' : 'text-gray-500'}`}>
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url('${player.avatar_url || ""}')` }}>
                                                        {!player.avatar_url && <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold text-xs">{player.full_name?.charAt(0)}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#0d1b12] dark:text-white group-hover:text-[#13ec5b] transition-colors">{player.full_name}</p>
                                                        <p className="text-xs text-gray-500">{player.position || 'Jogador'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{player.matches_played}</td>
                                            <td className={`px-6 py-4 text-center ${sortMode === 'goals' ? 'font-bold text-[#0d1b12] dark:text-white bg-[#13ec5b]/5 rounded-lg' : 'font-medium'}`}>{player.goals}</td>
                                            <td className={`px-6 py-4 text-center ${sortMode === 'assists' ? 'font-bold text-[#0d1b12] dark:text-white bg-[#13ec5b]/5 rounded-lg' : 'text-gray-500 dark:text-gray-400'}`}>{player.assists}</td>
                                            <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">{player.wins}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${sortMode === 'rating' ? 'bg-[#13ec5b] text-[#0d1b12]' : 'bg-[#e7f3eb] dark:bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b]'}`}>
                                                    {player.avg_rating} <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            <div className="h-8"></div>
        </div>
    );
}

function PodiumCard({ player, rank, sortMode, isWinner }: { player: PlayerStat, rank: number, sortMode: SortMode, isWinner?: boolean }) {
    const borderColor = rank === 1 ? 'border-[#13ec5b]' : rank === 2 ? 'border-gray-300 dark:border-gray-500' : 'border-amber-600 dark:border-amber-700';
    const bgColor = rank === 1 ? 'bg-[#13ec5b]' : rank === 2 ? 'bg-gray-300 dark:bg-gray-500' : 'bg-amber-600 dark:bg-amber-700';
    const size = isWinner ? 'w-24 h-24' : 'w-20 h-20';

    // Determine main stat to display based on sortMode
    const mainStatValue = sortMode === 'goals' ? player.goals : sortMode === 'assists' ? player.assists : player.avg_rating;
    const mainStatLabel = sortMode === 'goals' ? 'Gols' : sortMode === 'assists' ? 'Assists' : 'Nota';

    return (
        <div className={`flex flex-col items-center w-full ${isWinner ? 'order-1 md:order-2' : rank === 2 ? 'order-2 md:order-1' : 'order-3'}`}>
            <div className="relative group cursor-pointer w-full h-full">
                <div className={`bg-white dark:bg-[#1a2c20] ${isWinner ? 'p-8 min-h-[320px]' : 'p-6 min-h-[260px]'} rounded-2xl shadow-lg border ${isWinner ? 'border-2 border-[#13ec5b]/20' : 'border-[#e7f3eb] dark:border-[#2a4535]'} flex flex-col items-center relative z-10 transform hover:-translate-y-2 transition-transform h-full`}>
                    {isWinner && <span className="absolute -top-6 text-5xl drop-shadow-lg animate-bounce">👑</span>}

                    <div className="relative mb-4 mt-2">
                        <div className={`${size} rounded-full border-4 ${borderColor} overflow-hidden ring-4 ring-offset-2 dark:ring-offset-[#1a2c20] ring-transparent`}>
                            <div className="w-full h-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url('${player.avatar_url || ""}')` }}>
                                {!player.avatar_url && <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold text-xl">{player.full_name?.charAt(0)}</span>}
                            </div>
                        </div>
                        <div className={`absolute -bottom-3 -right-2 ${bgColor} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white dark:border-[#1a2c20]`}>{rank}</div>
                    </div>

                    <h3 className={`font-bold ${isWinner ? 'text-xl' : 'text-lg'} text-[#0d1b12] dark:text-white text-center line-clamp-1`}>{player.full_name.split(' ')[0]}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{player.position || 'Craque'}</p>

                    <div className="mt-auto w-full flex justify-center">
                        <div className={`text-center px-6 py-2 rounded-xl ${isWinner ? 'bg-[#13ec5b]/10' : 'bg-gray-50 dark:bg-[#2a4535]/50'}`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">{mainStatLabel}</div>
                            <div className={`font-black ${isWinner ? 'text-3xl text-[#0ea841] dark:text-[#13ec5b]' : 'text-2xl text-[#0d1b12] dark:text-white'}`}>{mainStatValue}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
