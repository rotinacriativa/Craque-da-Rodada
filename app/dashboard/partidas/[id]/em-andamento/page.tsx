"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../../../../../../src/lib/client";

interface MatchEvent {
    id: string;
    type: 'goal' | 'card_yellow' | 'card_red' | 'foul';
    team: 'A' | 'B';
    time: string; // MM:SS
    player_name: string;
    player_id?: string;
    created_at?: string;
}

export default function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const matchId = id;

    // Timer State
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Game State
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [events, setEvents] = useState<MatchEvent[]>([]);

    // Data State
    const [match, setMatch] = useState<any>(null);
    const [teams, setTeams] = useState<{ A: any[], B: any[] }>({ A: [], B: [] });
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        fetchMatchDetails();
    }, [matchId]);

    const fetchMatchDetails = async () => {
        try {
            // Fetch Match
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (matchError) throw matchError;
            setMatch(matchData);

            // Fetch Participants/Teams
            const { data: participants, error: partError } = await supabase
                .from('match_participants')
                .select(`
                    id, 
                    team, 
                    user_id,
                    profile:profiles(full_name, avatar_url)
                `)
                .eq('match_id', matchId)
                .eq('status', 'confirmed');

            if (partError) throw partError;

            // Organize by team
            const teamA: any[] = [];
            const teamB: any[] = [];

            participants?.forEach((p: any) => {
                if (p.team === 'A') teamA.push(p);
                else if (p.team === 'B') teamB.push(p);
            });

            setTeams({ A: teamA, B: teamB });

        } catch (error) {
            console.error("Error loading match:", error);
        } finally {
            setLoading(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        setSeconds(0);
        // Also add event "Início de Jogo" or similar logic if needed
    };

    // Actions
    const handleAction = (type: MatchEvent['type'], team: 'A' | 'B') => {
        // In a real app, this would open a modal to select the player
        // For prototype, we'll pick a random player or "Desconhecido"
        const teamPlayers = teams[team];
        const randomPlayer = teamPlayers.length > 0
            ? teamPlayers[Math.floor(Math.random() * teamPlayers.length)].profile.full_name
            : "Jogador Desconhecido";

        const newEvent: MatchEvent = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            team,
            time: formatTime(seconds),
            player_name: randomPlayer
        };

        setEvents((prev) => [newEvent, ...prev]);

        if (type === 'goal') {
            if (team === 'A') setScoreA(s => s + 1);
            else setScoreB(s => s + 1);
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando cronômetro...</div>;

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0d1612]">
            {/* Header Simplified */}
            <header className="px-6 py-4 bg-white dark:bg-[#1a2c22] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <h1 className="font-bold text-[#0d1b12] dark:text-white text-lg">Ao Vivo</h1>
                </div>
                {match && (
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {match.name}
                    </div>
                )}
                <Link
                    href={`/dashboard/grupos/${match?.group_id}/partidas/${matchId}`}
                    className="p-2 text-slate-400 hover:text-[#13ec5b] transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </Link>
            </header>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto flex flex-col gap-6">

                    {/* Scoreboard Card */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#1a2c22] rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-transparent to-blue-500 opacity-50"></div>

                        {/* Team A */}
                        <div className="md:col-span-4 flex flex-col md:flex-row items-center justify-between gap-4 md:pl-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-900/50 border-2 border-red-500/30">
                                    A
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">Time A</h2>
                                </div>
                            </div>
                            <div className="text-5xl md:text-7xl font-black text-red-500 tabular-nums tracking-tighter drop-shadow-sm">
                                {scoreA.toString().padStart(2, '0')}
                            </div>
                        </div>

                        {/* VS */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center py-2 md:py-0">
                            <span className="text-slate-600 font-black text-2xl opacity-30 italic">VERSUS</span>
                        </div>

                        {/* Team B */}
                        <div className="md:col-span-4 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:pr-8">
                            <div className="text-5xl md:text-7xl font-black text-blue-500 tabular-nums tracking-tighter drop-shadow-sm">
                                {scoreB.toString().padStart(2, '0')}
                            </div>
                            <div className="flex flex-row-reverse md:flex-row items-center gap-4">
                                <div className="text-center md:text-right">
                                    <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">Time B</h2>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/50 border-2 border-blue-500/30">
                                    B
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls & Actions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Team A Actions */}
                        <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ações Time A</h3>
                            </div>
                            <ActionButton onClick={() => handleAction('goal', 'A')} icon="sports_soccer" label="Gol" colorClass="text-red-500 border-red-500" bgClass="bg-red-50 text-red-600" />
                            <ActionButton onClick={() => handleAction('card_yellow', 'A')} icon="style" label="Cartão" colorClass="text-amber-500 border-amber-500" bgClass="bg-amber-50 text-amber-600" />
                            <ActionButton onClick={() => handleAction('foul', 'A')} icon="pan_tool" label="Falta" colorClass="text-slate-500 border-slate-500" bgClass="bg-slate-100 text-slate-600" />
                        </div>

                        {/* Timer Center */}
                        <div className="lg:col-span-6 flex flex-col items-center justify-center gap-8 py-4 order-1 lg:order-2">
                            <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
                                {/* Simple SVG Circle Timer */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="2" />
                                    {/* Progress Circle (Mock logic for visual) */}
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#13ec5b" strokeWidth="2" strokeDasharray="283" strokeDashoffset={283 - (283 * ((seconds % 60) / 60))} className="transition-all duration-1000 ease-linear" />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tempo de Jogo</span>
                                    <div className="text-6xl md:text-7xl font-black text-[#0d1b12] dark:text-white tracking-tighter tabular-nums drop-shadow-md">
                                        {formatTime(seconds)}
                                    </div>
                                    <span className={`mt-2 px-3 py-1 text-xs font-bold rounded-full border animate-pulse ${isRunning ? 'bg-slate-800 text-[#13ec5b] border-slate-700' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                                        {isRunning ? 'EM ANDAMENTO' : 'PAUSADO'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={resetTimer}
                                    className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all hover:scale-105" title="Resetar">
                                    <span className="material-symbols-outlined text-[28px]">restart_alt</span>
                                </button>
                                <button
                                    onClick={toggleTimer}
                                    className={`w-20 h-20 rounded-full text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30' : 'bg-[#13ec5b] hover:bg-[#0fd652] shadow-[#13ec5b]/30'}`} title={isRunning ? "Pausar" : "Iniciar"}>
                                    <span className="material-symbols-outlined text-[42px] icon-filled">{isRunning ? 'pause' : 'play_arrow'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Team B Actions */}
                        <div className="lg:col-span-3 flex flex-col gap-3 order-3">
                            <div className="flex items-center justify-end gap-2 mb-2 px-2">
                                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ações Time B</h3>
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            </div>
                            <ActionButton onClick={() => handleAction('goal', 'B')} icon="sports_soccer" label="Gol" colorClass="text-blue-500 border-blue-500" bgClass="bg-blue-50 text-blue-600" reverse />
                            <ActionButton onClick={() => handleAction('card_yellow', 'B')} icon="style" label="Cartão" colorClass="text-amber-500 border-amber-500" bgClass="bg-amber-50 text-amber-600" reverse />
                            <ActionButton onClick={() => handleAction('foul', 'B')} icon="pan_tool" label="Falta" colorClass="text-slate-500 border-slate-500" bgClass="bg-slate-100 text-slate-600" reverse />
                        </div>
                    </div>

                    {/* Event Log */}
                    <div className="mt-4 bg-white dark:bg-[#1a2c22] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden max-h-96">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">history</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Últimos Eventos</h3>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-4">
                            <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                                {events.map((event) => (
                                    <div key={event.id} className="relative animate-in slide-in-from-left fade-in duration-300">
                                        <span className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a2c22] shadow-sm ${event.type === 'goal' ? (event.team === 'A' ? 'bg-red-500' : 'bg-blue-500') :
                                            event.type.includes('card') ? 'bg-amber-400' : 'bg-slate-400'
                                            }`}></span>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-start sm:items-center gap-3">
                                                <span className="font-mono font-bold text-slate-400 text-sm">{event.time}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${event.type === 'goal' ? 'bg-green-100 text-green-700' :
                                                    event.type === 'foul' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {event.type.replace('_', ' ')}
                                                </span>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{event.player_name}</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        ({event.team === 'A' ? 'Time A' : 'Time B'})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <p className="text-slate-400 text-sm italic">Nenhum evento registrado ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Action Buttons
function ActionButton({ onClick, icon, label, colorClass, bgClass, reverse = false }: any) {
    return (
        <button
            onClick={onClick}
            className={`group flex items-center justify-between p-4 bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-800 hover:border-current rounded-2xl shadow-sm transition-all active:scale-95 ${reverse ? 'flex-row-reverse' : ''} ${colorClass}`}>
            <div className={`flex items-center gap-3 ${reverse ? 'flex-row-reverse' : ''}`}>
                <span className={`w-10 h-10 rounded-full flex items-center justify-center material-symbols-outlined ${bgClass}`}>{icon}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-current transition-colors">{label}</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-current">add</span>
        </button>
    );
}
