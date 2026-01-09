"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
// Ensure correct relative path to client
import { supabase } from "../../../../../src/lib/client";

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

    // Team Colors
    const [colorA, setColorA] = useState('red');
    const [colorB, setColorB] = useState('blue');

    // Modal State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<MatchEvent['type'] | null>(null);
    const [modalTeam, setModalTeam] = useState<'A' | 'B'>('A');
    const [modalStep, setModalStep] = useState<'scorer' | 'assister' | 'player' | 'foul_type'>('player');
    const [tempScorer, setTempScorer] = useState<{ id: string, name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Vest Color State
    const [isColorPickerOpen, setIsColorPickerOpen] = useState<{ team: 'A' | 'B' } | null>(null);

    const colors = [
        { name: 'Vermelho', class: 'red' },
        { name: 'Azul', class: 'blue' },
        { name: 'Verde', class: 'green' },
        { name: 'Amarelo', class: 'yellow' },
        { name: 'Laranja', class: 'orange' },
        { name: 'Preto', class: 'black' },
        { name: 'Branco', class: 'white' },
    ];

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
                    goals,
                    assists,
                    profile:profiles(full_name, avatar_url)
                `)
                .eq('match_id', matchId)
                .eq('status', 'confirmed');

            if (partError) throw partError;

            // Organize by team
            const teamA: any[] = [];
            const teamB: any[] = [];

            participants?.forEach((p: any) => {
                const formatted = {
                    ...p,
                    full_name: p.profile?.full_name || 'Jogador',
                    avatar_url: p.profile?.avatar_url
                };
                if (p.team === 'A') teamA.push(formatted);
                else if (p.team === 'B') teamB.push(formatted);
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
    };

    // Actions
    const handleActionClick = (type: MatchEvent['type'], team: 'A' | 'B') => {
        setModalAction(type);
        setModalTeam(team);

        if (type === 'goal') {
            setModalStep('scorer');
        } else if (type === 'foul' || type === 'card_yellow') {
            setModalStep('foul_type');
        } else {
            setModalStep('player');
        }

        setTempScorer(null);
        setSearchTerm("");
        setIsEventModalOpen(true);
    };

    const handlePlayerSelect = async (player: any) => {
        if (modalAction === 'goal' && modalStep === 'scorer') {
            setTempScorer({ id: player.id, name: player.full_name });
            setModalStep('assister');
            setSearchTerm("");
            return;
        }

        // Finalize event
        await createMatchEvent(player, modalAction!, modalTeam, modalAction === 'goal' ? tempScorer : null);
    };

    const skipAssistance = async () => {
        await createMatchEvent(null, 'goal', modalTeam, tempScorer);
    };

    const createMatchEvent = async (player: any, type: MatchEvent['type'], team: 'A' | 'B', scorer?: { id: string, name: string } | null) => {
        const playerName = type === 'goal' ? scorer!.name : player.full_name;
        const playerId = type === 'goal' ? scorer!.id : player.id;
        const assistName = type === 'goal' && player ? player.full_name : null;
        const assistId = type === 'goal' && player ? player.id : null;

        const newEvent: MatchEvent = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            team,
            time: formatTime(seconds),
            player_name: assistName ? `${playerName} (Assist: ${assistName})` : playerName,
            player_id: playerId
        };

        setEvents((prev) => [newEvent, ...prev]);

        if (type === 'goal') {
            if (team === 'A') setScoreA(s => s + 1);
            else setScoreB(s => s + 1);
        }

        setIsEventModalOpen(false);

        // PERSISTENCE IN DB
        try {
            // 1. Update Participant Stats (Goals/Assists)
            if (type === 'goal') {
                // Increment Scorer Goals
                const { data: scorerData } = await supabase.from('match_participants').select('goals').eq('id', playerId).single();
                await supabase.from('match_participants').update({ goals: (scorerData?.goals || 0) + 1 }).eq('id', playerId);

                // Increment Assister Assists if exists
                if (assistId) {
                    const { data: assisterData } = await supabase.from('match_participants').select('assists').eq('id', assistId).single();
                    await supabase.from('match_participants').update({ assists: (assisterData?.assists || 0) + 1 }).eq('id', assistId);
                }
            }
            // Add to a match_events table if you had one, for now we just keep local log or we could have a table.
            // But user asked to "computa automaticamente", which likely means updating the match_participants totals we added earlier.
        } catch (err) {
            console.error("Error updating stats:", err);
        }
    };

    const teamAColor = colors.find(c => c.class === colorA) || colors[0];
    const teamBColor = colors.find(c => c.class === colorB) || colors[1];

    const colorClasses: Record<string, any> = {
        red: { bg: 'from-red-600 to-red-800', border: 'border-red-500/30', shadow: 'shadow-red-900/50', text: 'text-red-500', btn: 'bg-red-50 text-red-600 border-red-500' },
        blue: { bg: 'from-blue-600 to-blue-800', border: 'border-blue-500/30', shadow: 'shadow-blue-900/50', text: 'text-blue-500', btn: 'bg-blue-50 text-blue-600 border-blue-500' },
        green: { bg: 'from-green-600 to-green-800', border: 'border-green-500/30', shadow: 'shadow-green-900/50', text: 'text-green-500', btn: 'bg-green-50 text-green-600 border-green-500' },
        yellow: { bg: 'from-yellow-500 to-yellow-700', border: 'border-yellow-400/30', shadow: 'shadow-yellow-900/50', text: 'text-yellow-500', btn: 'bg-yellow-50 text-yellow-600 border-yellow-500' },
        orange: { bg: 'from-orange-500 to-orange-700', border: 'border-orange-400/30', shadow: 'shadow-orange-900/50', text: 'text-orange-500', btn: 'bg-orange-50 text-orange-600 border-orange-500' },
        black: { bg: 'from-neutral-800 to-black', border: 'border-neutral-700/30', shadow: 'shadow-black/50', text: 'text-neutral-400', btn: 'bg-neutral-900 text-neutral-400 border-neutral-700' },
        white: { bg: 'from-neutral-100 to-neutral-300', border: 'border-white/30', shadow: 'shadow-neutral-400/20', text: 'text-neutral-600', btn: 'bg-neutral-50 text-neutral-600 border-neutral-300' },
    };

    if (loading) return <div className="p-10 text-center">Carregando cronômetro...</div>;

    const modalPlayers = teams[modalTeam].filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (modalStep === 'assister' ? p.id !== tempScorer?.id : true)
    );

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
                                <button
                                    onClick={() => setIsColorPickerOpen({ team: 'A' })}
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br transition-all hover:scale-110 ${colorClasses[colorA].bg} flex items-center justify-center text-white font-black text-xl shadow-lg ${colorClasses[colorA].shadow} border-2 ${colorClasses[colorA].border}`}>
                                    A
                                </button>
                                <div className="text-center md:text-left">
                                    <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">Time A</h2>
                                </div>
                            </div>
                            <div className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-sm transition-colors ${colorClasses[colorA].text}`}>
                                {scoreA.toString().padStart(2, '0')}
                            </div>
                        </div>

                        {/* VS */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center py-2 md:py-0">
                            <span className="text-slate-600 font-black text-2xl opacity-30 italic">VERSUS</span>
                        </div>

                        {/* Team B */}
                        <div className="md:col-span-4 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:pr-8">
                            <div className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-sm transition-colors ${colorClasses[colorB].text}`}>
                                {scoreB.toString().padStart(2, '0')}
                            </div>
                            <div className="flex flex-row-reverse md:flex-row items-center gap-4">
                                <div className="text-center md:text-right">
                                    <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">Time B</h2>
                                </div>
                                <button
                                    onClick={() => setIsColorPickerOpen({ team: 'B' })}
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br transition-all hover:scale-110 ${colorClasses[colorB].bg} flex items-center justify-center text-white font-black text-xl shadow-lg ${colorClasses[colorB].shadow} border-2 ${colorClasses[colorB].border}`}>
                                    B
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controls & Actions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Team A Actions */}
                        <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <span className={`w-2 h-2 rounded-full ${colorClasses[colorA].text.replace('text-', 'bg-')}`}></span>
                                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ações Time A</h3>
                            </div>
                            <ActionButton onClick={() => handleActionClick('goal', 'A')} icon="sports_soccer" label="Gol" colorClass={colorClasses[colorA].text} bgClass={colorClasses[colorA].btn} />
                            <ActionButton onClick={() => handleActionClick('card_yellow', 'A')} icon="style" label="Cartão" colorClass="text-amber-500 border-amber-500" bgClass="bg-amber-50 text-amber-600" />
                            <ActionButton onClick={() => handleActionClick('foul', 'A')} icon="pan_tool" label="Falta" colorClass="text-slate-500 border-slate-500" bgClass="bg-slate-100 text-slate-600" />
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
                                <span className={`w-2 h-2 rounded-full ${colorClasses[colorB].text.replace('text-', 'bg-')}`}></span>
                            </div>
                            <ActionButton onClick={() => handleActionClick('goal', 'B')} icon="sports_soccer" label="Gol" colorClass={colorClasses[colorB].text} bgClass={colorClasses[colorB].btn} reverse />
                            <ActionButton onClick={() => handleActionClick('card_yellow', 'B')} icon="style" label="Cartão" colorClass="text-amber-500 border-amber-500" bgClass="bg-amber-50 text-amber-600" reverse />
                            <ActionButton onClick={() => handleActionClick('foul', 'B')} icon="pan_tool" label="Falta" colorClass="text-slate-500 border-slate-500" bgClass="bg-slate-100 text-slate-600" reverse />
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
                                        <span className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a2c22] shadow-sm ${event.type === 'goal' ? (event.team === 'A' ? colorClasses[colorA].text.replace('text-', 'bg-') : colorClasses[colorB].text.replace('text-', 'bg-')) :
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

            {/* EVENT MODAL */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a2c22] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">
                                    {modalAction === 'goal'
                                        ? (modalStep === 'scorer' ? 'Quem fez o gol?' : 'Quem deu a assistência?')
                                        : (modalStep === 'foul_type' ? 'O que aconteceu?' : 'Selecione o jogador')}
                                </h3>
                                <p className="text-sm text-slate-500">Time {modalTeam}</p>
                            </div>
                            <button onClick={() => setIsEventModalOpen(false)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4">
                            {modalStep === 'foul_type' ? (
                                <div className="flex flex-col gap-3 py-2">
                                    <button
                                        onClick={() => { setModalAction('foul'); setModalStep('player'); }}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-500">pan_tool</span>
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">Falta Simples</span>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </button>

                                    <button
                                        onClick={() => { setModalAction('card_yellow'); setModalStep('player'); }}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-amber-500">style</span>
                                            </div>
                                            <span className="font-bold text-amber-900 dark:text-amber-200 text-lg">Cartão Amarelo</span>
                                        </div>
                                        <span className="material-symbols-outlined text-amber-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </button>

                                    <button
                                        onClick={() => { setModalAction('card_red'); setModalStep('player'); }}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-red-500">style</span>
                                            </div>
                                            <span className="font-bold text-red-900 dark:text-red-200 text-lg">Cartão Vermelho</span>
                                        </div>
                                        <span className="material-symbols-outlined text-red-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            placeholder="Buscar jogador..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#13ec5b] dark:text-white"
                                        />
                                        <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400">search</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {modalPlayers.map((player: any) => (
                                            <button
                                                key={player.id}
                                                onClick={() => handlePlayerSelect(player)}
                                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#13ec5b]/10 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-[#13ec5b]/20"
                                            >
                                                <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('${player.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#13ec5b]">{player.full_name}</span>
                                                <span className="material-symbols-outlined ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                                            </button>
                                        ))}
                                        {modalStep === 'assister' && (
                                            <button
                                                onClick={skipAssistance}
                                                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                                            >
                                                <span className="material-symbols-outlined">block</span>
                                                Sem assistência
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* COLOR PICKER MODAL */}
            {isColorPickerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsColorPickerOpen(null)}>
                    <div className="bg-white dark:bg-[#1a2c22] w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white mb-6">Cor do colete (Time {isColorPickerOpen.team})</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {colors.map(c => (
                                <button
                                    key={c.class}
                                    onClick={() => {
                                        if (isColorPickerOpen.team === 'A') setColorA(c.class);
                                        else setColorB(c.class);
                                        setIsColorPickerOpen(null);
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:scale-105 transition-all
                                        ${(isColorPickerOpen.team === 'A' ? colorA : colorB) === c.class ? 'bg-slate-50 dark:bg-slate-800 ring-2 ring-[#13ec5b]' : 'bg-white dark:bg-slate-900'}
                                    `}
                                >
                                    <div className={`size-8 rounded-lg bg-gradient-to-br ${colorClasses[c.class].bg}`}></div>
                                    <span className="text-sm font-bold dark:text-white">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
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
                <span className={`w-10 h-10 rounded-full flex items-center justify-center material-symbols-outlined shadow-sm ${bgClass}`}>{icon}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-current transition-colors">{label}</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-current opacity-40">add</span>
        </button>
    );
}
