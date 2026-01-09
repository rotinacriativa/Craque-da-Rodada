"use client";

import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../src/lib/client";
import ConfirmationModal from "../../../components/ConfirmationModal";
import AddPlayerModal from "../../../components/AddPlayerModal";

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
    const router = useRouter();

    const [match, setMatch] = useState<Match | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [generatedTeams, setGeneratedTeams] = useState<{ A: Participant[], B: Participant[] } | null>(null);

    // Voting State
    const [myVote, setMyVote] = useState<Vote | null>(null);
    const [showVoting, setShowVoting] = useState(false);
    const [voteResults, setVoteResults] = useState<{ userId: string; count: number; user: Participant }[] | null>(null);

    // Cancel Match State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    // Add Player Modal
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

    const handleCancelMatch = () => {
        setIsCancelModalOpen(true);
    };

    const confirmCancelMatch = async () => {
        setIsCanceling(true);
        try {
            // 1. Delete Dependencies (Participants & Votes)
            await supabase.from('match_participants').delete().eq('match_id', matchId);
            await supabase.from('match_votes').delete().eq('match_id', matchId);

            // 2. Delete the Match
            const { error } = await supabase
                .from('matches')
                .delete()
                .eq('id', matchId);

            if (error) throw error;

            setSuccessMessage("Jogo cancelado com sucesso.");
            // Slight delay or immediate redirect
            router.push(match?.group_id ? `/dashboard/grupos/${match.group_id}` : '/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            setErrorMessage("Erro ao cancelar jogo: " + (error?.message || "Erro desconhecido"));
            setIsCanceling(false);
            setIsCancelModalOpen(false);
        }
    };

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

            // 3. Get Group Details & Check Admin
            if (matchData.group_id) {
                const { data: groupData } = await supabase
                    .from('groups')
                    .select('name')
                    .eq('id', matchData.group_id)
                    .single();
                if (groupData) setGroupName(groupData.name);

                if (user) {
                    const { data: memberData } = await supabase
                        .from('group_members')
                        .select('role')
                        .eq('group_id', matchData.group_id)
                        .eq('user_id', user.id)
                        .single();

                    if (memberData && (memberData.role === 'admin' || memberData.role === 'owner')) {
                        setIsAdmin(true);
                    }
                }
            }

            // 4. Get Participants
            const { data: partData, error: partError } = await supabase
                .from('match_participants')
                .select('id, user_id, status, team')
                .eq('match_id', matchId);

            if (partError) throw partError;

            // Fetch Profiles Manually to avoid relation issues
            const userIds = (partData || []).map((p: any) => p.user_id);
            const profilesMap: Record<string, any> = {};

            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, position, skill_level')
                    .in('id', userIds);

                if (profilesData) {
                    profilesData.forEach((profile: any) => {
                        profilesMap[profile.id] = profile;
                    });
                }
            }

            const formattedParticipants = (partData as any[]).map(p => ({
                id: p.id,
                user_id: p.user_id,
                status: p.status,
                team: p.team,
                profile: profilesMap[p.user_id] || { full_name: 'Usuário', avatar_url: null, position: '-', skill_level: '' }
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
                    .maybeSingle();

                if (myVoteData) {
                    setMyVote({ voted_user_id: myVoteData.voted_user_id, category: 'craque' });
                    await calculateResults();
                }
            }

        } catch (error: any) {
            console.error("Error loading match:", error);
            if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
                console.error("Empty error detail:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
            }
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

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (errorMessage || successMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage, successMessage]);

    // Actions
    const handleJoin = async () => {
        if (!currentUser) return setErrorMessage("Faça login para participar.");
        const spotsLeft = match ? match.capacity - (participants.filter(p => p.status === 'confirmed').length) : 0;
        if (spotsLeft <= 0) return setErrorMessage("Jogo lotado! Entre na lista de espera (em breve).");

        setActionLoading(true);
        setErrorMessage(null);
        const myParticipant = participants.find(p => p.user_id === currentUser);
        try {
            if (myParticipant) {
                await supabase.from('match_participants').update({ status: 'confirmed' }).eq('id', myParticipant.id);
            } else {
                await supabase.from('match_participants').insert({ match_id: matchId, user_id: currentUser, status: 'confirmed' });
            }
            fetchData();
            setSuccessMessage("Presença confirmada!");
        } catch (error: any) {
            console.error(error);
            setErrorMessage("Erro ao confirmar presença: " + (error.message || "Tente novamente."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        const myParticipant = participants.find(p => p.user_id === currentUser);
        if (!myParticipant) return;
        if (!confirm("Tem certeza que vai furar? 🐔")) return;

        setActionLoading(true);
        setErrorMessage(null);
        try {
            await supabase.from('match_participants').delete().eq('id', myParticipant.id);
            fetchData();
            setSuccessMessage("Você saiu do jogo.");
        } catch (error: any) {
            console.error(error);
            setErrorMessage("Erro ao sair do jogo.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleGenerateTeams = async () => {
        const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
        if (confirmedPlayers.length < 2) return setErrorMessage("Precisa de pelo menos 2 jogadores para sortear.");

        setActionLoading(true);
        setErrorMessage(null);
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
            setSuccessMessage("Times sorteados com sucesso!");
            fetchData();
        } catch (error) {
            console.error("Error saving teams:", error);
            setErrorMessage("Erro ao salvar times no banco.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVote = async (targetUserId: string) => {
        if (!currentUser) return;
        setActionLoading(true);
        setErrorMessage(null);
        try {
            const { error } = await supabase.from('match_votes').insert({
                match_id: matchId,
                voter_id: currentUser,
                voted_user_id: targetUserId,
                category: 'craque'
            });

            if (error) {
                if (error.code === '23505') setErrorMessage("Você já votou!");
                else throw error;
            } else {
                setMyVote({ voted_user_id: targetUserId, category: 'craque' });
                setSuccessMessage("Voto computado! ⭐");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Erro ao votar.");
        } finally {
            setActionLoading(false);
        }
    };


    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
        </div>
    );
    if (!match) return <div className="p-12 text-center text-slate-500">Jogo não encontrado.</div>;

    const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
    const myParticipant = participants.find(p => p.user_id === currentUser);
    const isConfirmed = myParticipant?.status === 'confirmed';
    const spotsLeft = match.capacity - confirmedPlayers.length;

    // Check if match is "finished" for voting context.
    // For DEMO: If user clicks "Avaliar Partida" or if generated teams exist we enable it.
    // Let's toggle voting with a button "Iniciar Votação" (visible to everyone for simplicity or admin)

    const dateStr = new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(match.price);
    const priceParts = formattedPrice.replace('R$', '').trim().split(',');
    const priceMajor = priceParts[0];
    const priceMinor = priceParts[1] || '00';

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
            {/* Notifications */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right fade-in duration-300 pointer-events-auto">
                        <strong className="font-bold block text-sm">Erro!</strong>
                        <span className="block sm:inline text-sm">{errorMessage}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right fade-in duration-300 pointer-events-auto">
                        <strong className="font-bold block text-sm">Sucesso!</strong>
                        <span className="block sm:inline text-sm">{successMessage}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4">
                        {/* Breadcrumbs */}
                        <nav aria-label="Breadcrumb" className="hidden md:flex mb-2">
                            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                                <li className="inline-flex items-center">
                                    <Link className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#13ec5b] dark:text-gray-400 dark:hover:text-white transition-colors" href="/dashboard">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                                        <Link className="ml-1 text-sm font-medium text-gray-500 hover:text-[#13ec5b] md:ml-1 dark:text-gray-400 dark:hover:text-white transition-colors" href={`/dashboard/grupos/${match.group_id}`}>
                                            {groupName || 'Grupo'}
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                                        <span className="ml-1 text-sm font-medium text-[#0d1b12] md:ml-1 dark:text-white truncate max-w-[200px]">{match.name}</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>

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
                            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                                Competitivo
                            </span>
                            {isAdmin && (
                                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                    <button
                                        onClick={handleCancelMatch}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-full text-xs font-bold text-red-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                                        Cancelar
                                    </button>
                                    <Link
                                        href={`/dashboard/grupos/${match.group_id}/admin`}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-xs font-bold text-[#0d1b12] dark:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">settings</span>
                                        Gerenciar
                                    </Link>
                                    <Link
                                        href={`/dashboard/partidas/${matchId}/em-andamento`}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#13ec5b] hover:bg-[#0fd652] rounded-full text-xs font-bold text-[#0d1b12] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">timer</span>
                                        Ao Vivo
                                    </Link>
                                </div>
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

                    {/* Location Card */}
                    <section className="rounded-2xl overflow-hidden border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-sm">
                        <div className="h-48 w-full bg-gray-200 relative group">
                            {/* Map Placeholder */}
                            <div className="absolute inset-0 bg-cover bg-center transition-opacity hover:opacity-90" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAXN2pk8LXHs1dsBLfAhgFB3zKlTTOOymcoK9-htdI6HJe7H_tFy3FbZy719E3qzsI-He-8AQwruCn5QbrQJ7SxwfefiaS04MlhIsAVPnOVYNabWFI6V45Wcs36gRxsCgZaPXs6zZmGFDTXEr5Vf_0YlWd3YotfGAOZiy0Ol2bt_4qg5e9p702ISVP8a_Iy9cWU3QLsBvrgSj1PG5OYJ1hOPgv27H0Ul9GyDljiyNB9jfQf2TdoORZL8uPnfPumx8pclO8jzirPwIY")' }}>
                            </div>
                            <button className="absolute bottom-4 right-4 bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[#13ec5b]">map</span>
                                Ver no Mapa
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-1 text-[#0d1b12] dark:text-white">{match.location}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Campo Society 7 • Grama Sintética</p>
                                    {/* Amenities */}
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#13ec5b]">local_parking</span>
                                            Estacionamento
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#13ec5b]">shower</span>
                                            Vestiário
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#13ec5b]">sports_bar</span>
                                            Bar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Voting Component (If confirmed and ready) */}
                    {isConfirmed && (
                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-600">stars</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Craque da Rodada</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Vote no melhor jogador do jogo</p>
                                    </div>
                                </div>
                                {!showVoting && !myVote && (
                                    <button
                                        onClick={() => setShowVoting(true)}
                                        className="text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-[#0d1b12] px-4 py-2 rounded-full transition-colors shadow-sm"
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
                            )}
                        </div>
                    )}


                    {/* Roster Section */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Quem vai jogar</h2>
                            <div className="flex bg-gray-100 dark:bg-[#183020] p-1 rounded-full">
                                <button className="px-4 py-1.5 rounded-full bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white shadow-sm text-sm font-bold">Confirmados ({confirmedPlayers.length})</button>
                                <button className="px-4 py-1.5 rounded-full text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#0d1b12] dark:hover:text-white transition-colors">Espera (0)</button>
                            </div>
                        </div>

                        {/* Teams Generator & Add Player Buttons */}
                        {isConfirmed && confirmedPlayers.length >= 2 && !generatedTeams && (
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAddPlayerOpen(true)}
                                    className="text-sm font-bold bg-[#13ec5b]/10 text-[#13ec5b] hover:bg-[#13ec5b]/20 px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    Adicionar Jogador
                                </button>
                                <button
                                    onClick={handleGenerateTeams}
                                    disabled={actionLoading}
                                    className="text-sm font-bold bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white border border-gray-200 dark:border-gray-700 hover:border-[#13ec5b] px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-lg">shuffle</span>
                                    Sortear Times
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Organizer Card (Mocked for now as first player or logic needed) */}
                            {/* Ideally identify organizer from props. Using first player as placeholder if no specific role logic yet for display */}

                            {confirmedPlayers.map(p => (
                                <div key={p.id} className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <div className="size-12 rounded-full bg-gray-300 bg-cover bg-center" style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                        <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] p-0.5 rounded-full border-2 border-white dark:border-[#102216]">
                                            <span className="material-symbols-outlined text-[10px] block font-bold">check</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#0d1b12] dark:text-white">{p.profile.full_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{p.profile.position || 'Jogador'}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Placeholder for empty spots */}
                            {Array.from({ length: Math.max(0, match.capacity - confirmedPlayers.length) }).slice(0, 2).map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center p-3 gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-700 opacity-60">
                                    <div className="size-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-400">Vaga disponível</p>
                                        <p className="text-xs text-gray-400">Convide um amigo</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Action Card (Span 4) */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-24 flex flex-col gap-6">
                        {/* Status/Action Card */}
                        <div className="rounded-2xl border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-xl shadow-green-900/5 p-6 flex flex-col gap-6">
                            {/* Vacancy Info */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                                    <span className="text-sm font-bold text-[#0d1b12] dark:text-white">Confirmado {confirmedPlayers.length}/{match.capacity}</span>
                                </div>
                                <div className="w-full h-3 bg-[#e7f3eb] dark:bg-[#102216] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#13ec5b] rounded-full transition-all duration-500" style={{ width: `${(confirmedPlayers.length / match.capacity) * 100}%` }}></div>
                                </div>
                                {spotsLeft > 0 && spotsLeft <= 5 && (
                                    <div className="flex items-center gap-2 text-[#4c9a66] dark:text-[#13ec5b] text-sm font-medium mt-1">
                                        <span className="material-symbols-outlined text-lg">bolt</span>
                                        Restam apenas {spotsLeft} vagas!
                                    </div>
                                )}
                            </div>

                            <hr className="border-[#e7f3eb] dark:border-white/10" />

                            {/* Cost Info */}
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Custo por pessoa</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-[#0d1b12] dark:text-white">R$ {priceMajor}</span>
                                        <span className="text-sm font-bold text-gray-400">,{priceMinor}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400">Pagamento via App</span>
                                </div>
                            </div>

                            {/* Main Actions */}
                            <div className="flex flex-col gap-3">
                                {isConfirmed ? (
                                    <>
                                        <button className="group relative flex w-full cursor-default items-center justify-center overflow-hidden rounded-full h-14 bg-green-700 text-white text-lg font-bold">
                                            <span className="relative flex items-center gap-2">
                                                <span className="material-symbols-outlined">check_circle</span>
                                                Presença Confirmada
                                            </span>
                                        </button>
                                        <button onClick={handleLeave} disabled={actionLoading} className="w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 text-red-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            Não posso mais ir
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleJoin}
                                            disabled={actionLoading || spotsLeft <= 0}
                                            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-[#13ec5b] text-[#0d1b12] text-lg font-bold shadow-lg shadow-green-400/20 hover:shadow-green-400/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <span className="relative flex items-center gap-2">
                                                {spotsLeft <= 0 ? 'Lotado' : 'Confirmar Presença'}
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </span>
                                        </button>
                                        {!isConfirmed && (
                                            <button className="w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                Não posso ir
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <p className="text-xs text-center text-gray-400 dark:text-gray-500 leading-relaxed">
                                Ao confirmar, você concorda com as regras de cancelamento (24h antes).
                            </p>
                        </div>

                        {/* Quick Share */}
                        <div className="p-4 rounded-2xl bg-[#13ec5b]/10 border border-[#13ec5b]/20 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-[#0d1b12] dark:text-white text-sm">Convide amigos</span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">Faltam {Math.max(0, match.capacity - confirmedPlayers.length / 2)} pessoas!</span>
                            </div>
                            <button className="size-10 rounded-full bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white flex items-center justify-center shadow-sm hover:text-[#13ec5b] transition-colors">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal */}
            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={confirmCancelMatch}
                title="Cancelar Jogo"
                message={`Tem certeza que deseja cancelar o jogo "${match.name}"? Isso removerá o evento e notificará os jogadores.`}
                confirmText="Sim, Cancelar Jogo"
                type="danger"
                isLoading={isCanceling}
            />

            {match && (
                <AddPlayerModal
                    isOpen={isAddPlayerOpen}
                    onClose={() => setIsAddPlayerOpen(false)}
                    matchId={matchId}
                    groupId={match.group_id}
                    existingPlayerIds={participants.map(p => p.user_id)}
                    onAdd={fetchData}
                />
            )}
        </div>
    );
}
