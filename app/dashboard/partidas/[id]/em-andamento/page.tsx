"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Ensure correct relative path to client
import { supabase } from "../../../../../src/lib/client";
import { toast } from "sonner";

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
    const router = useRouter();

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
    const [teams, setTeams] = useState<Record<string, any[]>>({});
    const [availableTeams, setAvailableTeams] = useState<string[]>([]);
    const [activeTeamA, setActiveTeamA] = useState<string>('A');
    const [activeTeamB, setActiveTeamB] = useState<string>('B');
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

            // Fetch Participants/Teams with a fallback for missing columns
            let { data: participants, error: partError } = await supabase
                .from('match_participants')
                .select(`id, team, user_id, guest_name, goals, assists, wins, draws`)
                .eq('match_id', matchId)
                .eq('status', 'confirmed');

            // Fallback if columns don't exist yet
            if (partError && partError.message?.includes('column')) {
                console.warn("Falling back to minimal participant columns due to schema mismatch.");
                const { data: minimalData, error: minimalError } = await supabase
                    .from('match_participants')
                    .select(`id, team, user_id, goals, assists`)
                    .eq('match_id', matchId)
                    .eq('status', 'confirmed');

                if (minimalError) throw minimalError;
                participants = minimalData as any;
            } else if (partError) {
                throw partError;
            }

            // Fetch profiles separately
            const userIds = participants?.map(p => p.user_id).filter(Boolean) as string[];
            let profilesMap: Record<string, any> = {};

            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);

                if (profilesData) {
                    profilesMap = profilesData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});
                }
            }

            // Organize by team
            const organizedTeams: Record<string, any[]> = {};
            const teamLetters: string[] = [];

            if (participants && participants.length > 0) {
                participants.forEach((p: any) => {
                    const teamChar = p.team || 'A';
                    if (!organizedTeams[teamChar]) {
                        organizedTeams[teamChar] = [];
                        teamLetters.push(teamChar);
                    }

                    const profile = p.user_id ? profilesMap[p.user_id] : null;
                    const formatted = {
                        ...p,
                        full_name: profile?.full_name || p.guest_name || 'Jogador',
                        avatar_url: profile?.avatar_url
                    };
                    organizedTeams[teamChar].push(formatted);
                });
            }

            setTeams(organizedTeams);
            const sortedLetters = teamLetters.sort();
            setAvailableTeams(sortedLetters);

            // Default selection
            if (sortedLetters.length >= 2) {
                setActiveTeamA(prev => sortedLetters.includes(prev) ? prev : sortedLetters[0]);
                setActiveTeamB(prev => sortedLetters.includes(prev) ? prev : sortedLetters[1]);
            } else if (sortedLetters.length === 1) {
                setActiveTeamA(sortedLetters[0]);
                setActiveTeamB('B');
            }

        } catch (error: any) {
            console.error("Error loading match detail details:", error.message || error);
            toast.error("Erro técnico ao carregar partida.");
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

    const finishRound = async () => {
        const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Draw';
        const msg = winner === 'Draw' ? "Empate técnico!" : `Vitória do Time ${winner === 'A' ? activeTeamA : activeTeamB}!`;

        if (!confirm(`Finalizar Round: ${msg}\nDeseja computar os pontos e iniciar o próximo?`)) return;

        try {
            const teamAChar = activeTeamA;
            const teamBChar = activeTeamB;

            // Update wins/draws in DB
            const updates = [];

            // Team A Players
            for (const player of (teams[teamAChar] || [])) {
                if (winner === 'A') {
                    updates.push(supabase.rpc('increment_participant_stat', { p_id: player.id, p_col: 'wins' }));
                } else if (winner === 'Draw') {
                    updates.push(supabase.rpc('increment_participant_stat', { p_id: player.id, p_col: 'draws' }));
                }
            }

            // Team B Players
            for (const player of (teams[teamBChar] || [])) {
                if (winner === 'B') {
                    updates.push(supabase.rpc('increment_participant_stat', { p_id: player.id, p_col: 'wins' }));
                } else if (winner === 'Draw') {
                    updates.push(supabase.rpc('increment_participant_stat', { p_id: player.id, p_col: 'draws' }));
                }
            }

            await Promise.all(updates);

            setScoreA(0);
            setScoreB(0);
            setSeconds(0);
            setIsRunning(false);
            toast.success("Round finalizado e pontos computados!");

        } catch (err) {
            console.error("Error finishing round:", err);
            toast.error("Erro ao salvar round.");
        }
    };

    const finishMatch = async () => {
        if (!match) {
            toast.error("Dados da partida não carregados.");
            return;
        }

        if (!confirm("Encerrar de vez a pelada do dia? Isso fechará a súmula e salvará o resultado final.")) return;

        try {
            // Updated payload with final scores
            const { error } = await supabase
                .from('matches')
                .update({
                    status: 'finished',
                    score_a: scoreA,
                    score_b: scoreB,
                    updated_at: new Date().toISOString()
                })
                .eq('id', matchId);

            if (error) {
                console.error("Supabase error finishing match:", error);
                throw new Error(error.message || "Falha na permissão do banco de dados.");
            }

            toast.success("Pelada finalizada com sucesso! Partiu resenha! 🍻");
            router.push(`/dashboard/grupos/${match.group_id}/partidas/${matchId}`);
        } catch (err: any) {
            console.error("Error in finishMatch:", err);
            toast.error(`Erro ao finalizar: ${err.message || "Verifique se você é admin."}`);
        }
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
        const playerName = type === 'goal' ? scorer!.name : (player.profile?.full_name || player.guest_name || player.full_name);
        const playerId = type === 'goal' ? scorer!.id : player.id;
        const assistName = type === 'goal' && player ? (player.profile?.full_name || player.guest_name || player.full_name) : null;
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
            // 1. Update Participant Totals (using the helper RPC for safety)
            if (type === 'goal') {
                await supabase.rpc('increment_participant_stat', { p_id: playerId, p_col: 'goals' });
                if (assistId) {
                    await supabase.rpc('increment_participant_stat', { p_id: assistId, p_col: 'assists' });
                }
            }

            // 2. Save Event in history table
            await supabase.from('match_events').insert([{
                match_id: matchId,
                player_id: playerId,
                type,
                team,
                event_time: formatTime(seconds),
                assist_id: assistId
            }]);

        } catch (err) {
            console.error("Error persisting match event:", err);
            // Non-blocking for the UI
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

    const modalTeamLetter = modalTeam === 'A' ? activeTeamA : activeTeamB;
    const modalPlayers = (teams[modalTeamLetter] || []).filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (modalStep === 'assister' ? p.id !== tempScorer?.id : true)
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0d1612]">
            {/* Header Simplified */}
            <header className="px-6 py-4 bg-white dark:bg-[#1a2c22] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/grupos/${match?.group_id}/partidas/${matchId}`}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <h1 className="font-bold text-[#0d1b12] dark:text-white text-lg">Ao Vivo</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={finishMatch}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">flag</span>
                        ENCERRAR PELADA
                    </button>
                </div>
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
                                <div className="relative">
                                    <button
                                        onClick={() => setIsColorPickerOpen({ team: 'A' })}
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br transition-all hover:scale-110 ${colorClasses[colorA].bg} flex items-center justify-center text-white font-black text-xl shadow-lg ${colorClasses[colorA].shadow} border-2 ${colorClasses[colorA].border}`}>
                                        {activeTeamA}
                                    </button>
                                    {availableTeams && availableTeams.length > 1 && (
                                        <select
                                            value={activeTeamA}
                                            onChange={(e) => setActiveTeamA(e.target.value)}
                                            className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg px-1 border border-slate-700"
                                        >
                                            {availableTeams.filter(t => t !== activeTeamB).map(t => <option key={t} value={t}>Time {t}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">Time {activeTeamA}</h2>
                                </div>
                            </div>
                            <div className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-sm transition-colors ${colorClasses[colorA].text}`}>
                                {scoreA.toString().padStart(2, '0')}
                            </div>
                        </div>

                        {/* VS */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center py-2 md:py-0">
                            <button
                                onClick={finishRound}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#13ec5b] text-xs font-black rounded-full border border-slate-700 transition-all active:scale-95"
                            >
                                FINALIZAR ROUND
                            </button>
                        </div>

                        {/* Team B */}
                        <div className="md:col-span-4 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:pr-8">
                            <div className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-sm transition-colors ${colorClasses[colorB].text}`}>
                                {scoreB.toString().padStart(2, '0')}
                            </div>
                            <div className="flex flex-row-reverse md:flex-row items-center gap-4">
                                <div className="text-center md:text-right">
                                    <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">Time {activeTeamB}</h2>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsColorPickerOpen({ team: 'B' })}
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br transition-all hover:scale-110 ${colorClasses[colorB].bg} flex items-center justify-center text-white font-black text-xl shadow-lg ${colorClasses[colorB].shadow} border-2 ${colorClasses[colorB].border}`}>
                                        {activeTeamB}
                                    </button>
                                    {availableTeams && availableTeams.length > 1 && (
                                        <select
                                            value={activeTeamB}
                                            onChange={(e) => setActiveTeamB(e.target.value)}
                                            className="absolute -bottom-2 -left-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg px-1 border border-slate-700"
                                        >
                                            {availableTeams.filter(t => t !== activeTeamA).map(t => <option key={t} value={t}>Time {t}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls & Actions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <span className={`w-2 h-2 rounded-full ${colorClasses[colorA].text.replace('text-', 'bg-')}`}></span>
                                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ações Time {activeTeamA}</h3>
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

                        <div className="lg:col-span-3 flex flex-col gap-3 order-3">
                            <div className="flex items-center justify-end gap-2 mb-2 px-2">
                                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ações Time {activeTeamB}</h3>
                                <span className={`w-2 h-2 rounded-full ${colorClasses[colorB].text.replace('text-', 'bg-')}`}></span>
                            </div>
                            <ActionButton onClick={() => handleActionClick('goal', 'B')} icon="sports_soccer" label="Gol" colorClass={colorClasses[colorB].text} bgClass={colorClasses[colorB].btn} reverse />
                            Slot                            <ActionButton onClick={() => handleActionClick('card_yellow', 'B')} icon="style" label="Cartão" colorClass="text-amber-500 border-amber-500" bgClass="bg-amber-50 text-amber-600" reverse />
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
                                                        ({event.team === 'A' ? `Time ${activeTeamA}` : `Time ${activeTeamB}`})
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
