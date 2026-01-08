"use client";

import Link from "next/link";
import { useState, use, useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";

interface Match {
    id: string;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    price: number;
    capacity: number;
    group_id: string;
}

interface Participant {
    id: string; // match_participants.id
    user_id: string;
    status: 'confirmed' | 'waitlist' | 'declined';
    team: 'A' | 'B' | null;
    profile: {
        full_name: string;
        avatar_url: string;
        position: string;
        skill_level: string;
    };
}

interface Vote {
    voted_user_id: string;
    category: 'craque' | 'bagre';
}

export default function MatchDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const matchId = id;

    const [match, setMatch] = useState<Match | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [generatedTeams, setGeneratedTeams] = useState<{ A: Participant[], B: Participant[] } | null>(null);

    // Voting State
    const [myVote, setMyVote] = useState<Vote | null>(null);
    const [showVoting, setShowVoting] = useState(false);
    const [voteResults, setVoteResults] = useState<{ userId: string; count: number; user: Participant }[] | null>(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user?.id || null);

            // 2. Get Match
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (matchError) throw matchError;
            setMatch(matchData);

            // 3. Get Participants
            const { data: partData, error: partError } = await supabase
                .from('match_participants')
                .select(`
                    id,
                    user_id,
                    status,
                    team,
                    profile:profiles (
                        full_name,
                        avatar_url,
                        position,
                        skill_level
                    )
                `)
                .eq('match_id', matchId);

            if (partError) throw partError;

            const formattedParticipants = (partData as any[]).map(p => ({
                id: p.id,
                user_id: p.user_id,
                status: p.status,
                team: p.team,
                profile: p.profile || { full_name: 'Usuário', avatar_url: null, position: '-', skill_level: '' }
            }));

            setParticipants(formattedParticipants);

            // Check teams
            const teamA = formattedParticipants.filter((p: Participant) => p.team === 'A');
            const teamB = formattedParticipants.filter((p: Participant) => p.team === 'B');
            if (teamA.length > 0 || teamB.length > 0) {
                setGeneratedTeams({ A: teamA, B: teamB });
            }

            // 4. Get Votes (Check if I voted and Get Results)
            if (user) {
                const { data: myVoteData } = await supabase
                    .from('match_votes')
                    .select('*')
                    .eq('match_id', matchId)
                    .eq('voter_id', user.id)
                    .eq('category', 'craque')
                    .maybeSingle(); // Use maybeSingle to avoid 406 error if no rows

                if (myVoteData) {
                    setMyVote({ voted_user_id: myVoteData.voted_user_id, category: 'craque' });
                    // If I voted, assume voting is open/done, so let's fetch results? 
                    // Or keep voting open. Let's show results only if user voted.
                    calculateResults();
                }
            }

        } catch (error) {
            console.error("Error loading match:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateResults = async () => {
        const { data: allVotes } = await supabase
            .from('match_votes')
            .select('voted_user_id')
            .eq('match_id', matchId)
            .eq('category', 'craque');

        if (!allVotes) return;

        // Count votes
        const counts: Record<string, number> = {};
        allVotes.forEach((v: any) => {
            counts[v.voted_user_id] = (counts[v.voted_user_id] || 0) + 1;
        });

        // Map to users
        const results = Object.entries(counts).map(([uid, count]) => {
            const participant = participants.find(p => p.user_id === uid); // Access state participants carefully. 
            // NOTE: State 'participants' might not be fresh inside this closure if not using refs, but normally valid after mount.
            // Better to re-find from current scope or fetched data.
            // For now, let's rely on it being available or use formattedParticipants passed if we refactor.
            // ACTUALLY: `participants` here is stale closure from when `calculateResults` was defined? No, it's component scope.
            // But since I call `calculateResults` inside fetchData which setsParticipants... race condition?
            // Let's safe guard: I'll use participants from state, but wait for next render?
            // Easier: Just fetch participants in calculateResults or trust React.
            return { userId: uid, count, user: participant };
        })
            .filter(r => r.user) // Filter out unknown users
            .sort((a, b) => b.count - a.count) as { userId: string; count: number; user: Participant }[];

        setVoteResults(results);
    };

    // Fix: Ensure vote results can find participants. Use useEffect dependencies.
    useEffect(() => {
        if (myVote && participants.length > 0) {
            calculateResults();
        }
    }, [myVote, participants.length]);


    useEffect(() => {
        fetchData();
    }, [matchId]);

    // Actions
    const handleJoin = async () => {
        if (!currentUser) return alert("Faça login para participar.");
        const spotsLeft = match ? match.capacity - (participants.filter(p => p.status === 'confirmed').length) : 0;
        if (spotsLeft <= 0) return alert("Partida lotada!");

        setActionLoading(true);
        const myParticipant = participants.find(p => p.user_id === currentUser);
        try {
            if (myParticipant) {
                await supabase.from('match_participants').update({ status: 'confirmed' }).eq('id', myParticipant.id);
            } else {
                await supabase.from('match_participants').insert({ match_id: matchId, user_id: currentUser, status: 'confirmed' });
            }
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Erro ao confirmar.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        const myParticipant = participants.find(p => p.user_id === currentUser);
        if (!myParticipant) return;
        if (!confirm("Tem certeza que vai fura? 🐔")) return;

        setActionLoading(true);
        try {
            await supabase.from('match_participants').delete().eq('id', myParticipant.id);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleGenerateTeams = async () => {
        const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
        if (confirmedPlayers.length < 2) return alert("Precisa de pelo menos 2 jogadores para sortear.");

        setActionLoading(true);
        const shuffled = [...confirmedPlayers].sort(() => Math.random() - 0.5);
        const teamA: Participant[] = [];
        const teamB: Participant[] = [];

        shuffled.forEach((p, index) => {
            if (index % 2 === 0) teamA.push(p);
            else teamB.push(p);
        });

        try {
            for (const p of teamA) await supabase.from('match_participants').update({ team: 'A' }).eq('id', p.id);
            for (const p of teamB) await supabase.from('match_participants').update({ team: 'B' }).eq('id', p.id);

            setGeneratedTeams({ A: teamA, B: teamB });
            alert("Times sorteados com sucesso!");
            fetchData();
        } catch (error) {
            console.error("Error saving teams:", error);
            alert("Erro ao salvar times.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVote = async (targetUserId: string) => {
        if (!currentUser) return;
        setActionLoading(true);
        try {
            const { error } = await supabase.from('match_votes').insert({
                match_id: matchId,
                voter_id: currentUser,
                voted_user_id: targetUserId,
                category: 'craque'
            });

            if (error) {
                if (error.code === '23505') alert("Você já votou!"); // Unique constraint
                else throw error;
            } else {
                setMyVote({ voted_user_id: targetUserId, category: 'craque' });
                alert("Voto computado! ⭐");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao votar.");
        } finally {
            setActionLoading(false);
        }
    };


    if (loading) return <div className="p-12 text-center text-slate-500">Carregando partida...</div>;
    if (!match) return <div className="p-12 text-center text-slate-500">Partida não encontrada.</div>;

    const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
    const myParticipant = participants.find(p => p.user_id === currentUser);
    const isConfirmed = myParticipant?.status === 'confirmed';
    const spotsLeft = match.capacity - confirmedPlayers.length;

    // Check if match is "finished" for voting context.
    // For DEMO: If user clicks "Avaliar Partida" or if generated teams exist we enable it.
    // Let's toggle voting with a button "Iniciar Votação" (visible to everyone for simplicity or admin)

    const dateStr = new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {spotsLeft > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#13ec5b]/20 px-3 py-1 text-sm font-bold text-green-800 dark:text-green-300">
                                    <span className="size-2 rounded-full bg-[#13ec5b] animate-pulse"></span>
                                    {spotsLeft} Vagas Abertas
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-800">
                                    Lotado
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-[#0d1b12] dark:text-white mb-2">
                                {match.name}
                            </h1>
                            <p className="text-lg md:text-xl text-[#4c9a66] dark:text-[#13ec5b] font-medium flex items-center gap-2 capitalize">
                                <span className="material-symbols-outlined">calendar_month</span>
                                {dateStr} • {match.start_time.slice(0, 5)} - {match.end_time?.slice(0, 5)}
                            </p>
                        </div>
                    </div>

                    {/* VOTING SECTION (New) */}
                    {isConfirmed && (
                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-600">stars</span>
                                    <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Craque da Rodada</h3>
                                </div>
                                {!showVoting && !myVote && (
                                    <button
                                        onClick={() => setShowVoting(true)}
                                        className="text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-[#0d1b12] px-4 py-2 rounded-lg transition-colors shadow-sm"
                                    >
                                        Votar Agora
                                    </button>
                                )}
                            </div>

                            {/* VOTING LIST */}
                            {showVoting && !myVote && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                                    {confirmedPlayers.filter(p => p.user_id !== currentUser).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleVote(p.user_id)}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#1a2c22] border border-yellow-200 hover:border-yellow-400 transition-all text-left group"
                                        >
                                            <div className="size-10 rounded-full bg-cover bg-center bg-gray-200 shrink-0" style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-[#0d1b12] dark:text-white truncate group-hover:text-yellow-600 transition-colors">{p.profile.full_name}</p>
                                                <p className="text-[10px] text-gray-500">Votar</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* RESULTS (After voting) */}
                            {myVote && voteResults && (
                                <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2c22] rounded-xl p-4 border border-yellow-100 dark:border-white/5">
                                    <p className="text-sm text-center text-gray-500">Você votou! Resultados parciais:</p>
                                    <div className="flex flex-col gap-3">
                                        {voteResults.slice(0, 3).map((r, i) => (
                                            <div key={r.userId} className="flex items-center gap-3">
                                                <span className={`font-black text-lg w-6 text-center ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{i + 1}º</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm text-[#0d1b12] dark:text-white">{r.user.profile.full_name}</span>
                                                        <span className="font-bold text-xs text-gray-500">{r.count} votos</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(r.count / confirmedPlayers.length) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Location Card & Teams (Existing) */}
                    <section className="rounded-2xl overflow-hidden border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-sm">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1 text-[#0d1b12] dark:text-white">{match.location}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Ver no Google Maps.</p>
                        </div>
                    </section>

                    {(generatedTeams && (generatedTeams.A.length > 0 || generatedTeams.B.length > 0)) && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Escalação</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-[#183020] rounded-2xl border-t-4 border-t-[#13ec5b] shadow-sm p-4">
                                    <h3 className="font-black text-lg text-center mb-4 text-[#0d1b12] dark:text-white uppercase tracking-wider">Time A</h3>
                                    <div className="flex flex-col gap-2">
                                        {generatedTeams.A.map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-[#102216]">
                                                <div className="size-8 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                                <span className="font-bold text-sm text-[#0d1b12] dark:text-white">{p.profile.full_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#183020] rounded-2xl border-t-4 border-t-orange-500 shadow-sm p-4">
                                    <h3 className="font-black text-lg text-center mb-4 text-[#0d1b12] dark:text-white uppercase tracking-wider">Time B</h3>
                                    <div className="flex flex-col gap-2">
                                        {generatedTeams.B.map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-[#102216]">
                                                <div className="size-8 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                                <span className="font-bold text-sm text-[#0d1b12] dark:text-white">{p.profile.full_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Roster Section */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Lista de Confirmados</h2>
                            {confirmedPlayers.length >= 2 && (
                                <button
                                    onClick={handleGenerateTeams}
                                    disabled={actionLoading}
                                    className="text-sm font-bold bg-[#13ec5b] text-[#0d1b12] px-4 py-2 rounded-lg hover:bg-[#0fd652]"
                                >
                                    Sortear Times
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {confirmedPlayers.map(p => (
                                <div key={p.id} className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <div className="size-12 rounded-full bg-gray-300 bg-cover bg-center border-2 border-white dark:border-[#102216]" style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                        {myVote?.voted_user_id === p.user_id && (
                                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full border-2 border-white text-[10px] font-bold px-1">Seu Voto</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#0d1b12] dark:text-white">{p.profile.full_name}</p>
                                        <p className="text-xs text-gray-500">{p.profile.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Action Card (Span 4) */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="rounded-2xl border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-xl shadow-green-900/5 p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#0d1b12] dark:text-white">{confirmedPlayers.length}/{match.capacity} Confirmados</span>
                                <div className="w-full h-3 bg-[#e7f3eb] dark:bg-[#102216] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#13ec5b] rounded-full transition-all" style={{ width: `${(confirmedPlayers.length / match.capacity) * 100}%` }}></div>
                                </div>
                            </div>
                            <hr className="border-[#e7f3eb] dark:border-white/10" />
                            <div className="flex flex-col gap-3">
                                {isConfirmed ? (
                                    <>
                                        <button disabled className="w-full h-14 bg-green-700 text-white rounded-full font-bold">Presença Confirmada</button>
                                        <button onClick={handleLeave} disabled={actionLoading} className="w-full h-12 border border-red-200 text-red-500 rounded-full font-bold">Desistir</button>
                                    </>
                                ) : (
                                    <button onClick={handleJoin} disabled={actionLoading || spotsLeft <= 0} className="w-full h-14 bg-[#13ec5b] text-[#0d1b12] rounded-full font-bold">{spotsLeft <= 0 ? 'Lotado' : 'Confirmar Presença'}</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
