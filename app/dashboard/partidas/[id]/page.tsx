"use client";

import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../src/lib/client";
import { getResilientUser } from "../../../../src/lib/auth-helpers";
import ConfirmationModal from "../../../components/ConfirmationModal";
import AddPlayerModal from "../../../components/AddPlayerModal";
import { LoadingSpinner } from "../../../components/shared/LoadingSpinner";
import { Breadcrumbs } from "../../../components/shared/Breadcrumbs";
import { ToastNotification } from "../../../components/shared/ToastNotification";
import { MatchHeader } from "../../../components/player/matches/MatchHeader";
import { LocationCard } from "../../../components/player/matches/LocationCard";
import { VotingSection } from "../../../components/player/matches/VotingSection";
import { ParticipantsList } from "../../../components/player/matches/ParticipantsList";
import { ActionCard } from "../../../components/player/matches/ActionCard";
import TeamGeneratorModal from "../../../components/TeamGeneratorModal";

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
    latitude?: number;
    longitude?: number;
}

interface Participant {
    id: string;
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

    // Voting State
    const [myVote, setMyVote] = useState<Vote | null>(null);
    const [showVoting, setShowVoting] = useState(false);
    const [voteResults, setVoteResults] = useState<{ userId: string; count: number; user: Participant }[] | null>(null);

    // Modals
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [isTeamGeneratorOpen, setIsTeamGeneratorOpen] = useState(false);

    // Messages
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

    const calculateResults = async () => {
        const { data: allVotes } = await supabase
            .from('match_votes')
            .select('voted_user_id')
            .eq('match_id', matchId)
            .eq('category', 'craque');

        if (!allVotes) return;

        const counts: Record<string, number> = {};
        allVotes.forEach((v: any) => {
            counts[v.voted_user_id] = (counts[v.voted_user_id] || 0) + 1;
        });

        const results = Object.entries(counts).map(([uid, count]) => {
            const participant = participants.find(p => p.user_id === uid);
            return { userId: uid, count, user: participant };
        })
            .filter(r => r.user) as { userId: string; count: number; user: Participant }[];

        results.sort((a, b) => b.count - a.count);
        setVoteResults(results);
    };

    useEffect(() => {
        if (myVote && participants.length > 0) {
            calculateResults();
        }
    }, [myVote, participants.length]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const user = await getResilientUser(supabase);
            setCurrentUser(user?.id || null);

            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (matchError) throw matchError;
            setMatch(matchData);

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

            const { data: partData, error: partError } = await supabase
                .from('match_participants')
                .select('id, user_id, status, team')
                .eq('match_id', matchId);

            if (partError) throw partError;

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [matchId]);

    const handleSaveTeams = async (teamsMap: { teamA: string[], teamB: string[], teamC: string[], teamD: string[] }) => {
        try {
            const updates: Promise<any>[] = [];

            const queueUpdate = (ids: string[], teamName: string) => {
                ids.forEach(id => {
                    updates.push(
                        supabase.from('match_participants').update({ team: teamName }).eq('id', id)
                    );
                });
            };

            queueUpdate(teamsMap.teamA, 'A');
            queueUpdate(teamsMap.teamB, 'B');
            queueUpdate(teamsMap.teamC, 'C');
            queueUpdate(teamsMap.teamD, 'D');

            await Promise.all(updates);

            setSuccessMessage("Times salvos com sucesso!");
            fetchData();
        } catch (error) {
            console.error("Error saving teams:", error);
            setErrorMessage("Erro ao salvar times.");
        }
    };

    const handleCancelMatch = () => {
        setIsCancelModalOpen(true);
    };

    const confirmCancelMatch = async () => {
        setIsCanceling(true);
        try {
            await supabase.from('match_participants').delete().eq('match_id', matchId);
            await supabase.from('match_votes').delete().eq('match_id', matchId);
            const { error } = await supabase.from('matches').delete().eq('id', matchId);
            if (error) throw error;

            setSuccessMessage("Jogo cancelado com sucesso.");
            router.refresh();
            router.replace('/dashboard');
        } catch (error: any) {
            console.error(error);
            setErrorMessage("Erro ao cancelar jogo: " + (error?.message || "Erro desconhecido"));
            setIsCanceling(false);
            setIsCancelModalOpen(false);
        }
    };

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

    if (loading) return <LoadingSpinner size="lg" fullScreen />;
    if (!match) return <div className="p-12 text-center text-slate-500">Jogo não encontrado.</div>;

    const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
    const myParticipant = participants.find(p => p.user_id === currentUser);
    const isConfirmed = myParticipant?.status === 'confirmed';
    const spotsLeft = match.capacity - confirmedPlayers.length;

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
            {/* Notifications */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
                {errorMessage && <ToastNotification type="error" message={errorMessage} />}
                {successMessage && <ToastNotification type="success" message={successMessage} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/dashboard' },
                            { label: groupName || 'Grupo', href: `/dashboard/grupos/${match.group_id}` },
                            { label: match.name }
                        ]}
                    />

                    <MatchHeader
                        match={match}
                        groupName={groupName}
                        spotsLeft={spotsLeft}
                        isAdmin={isAdmin}
                        matchId={matchId}
                        groupId={match.group_id}
                        onCancelMatch={handleCancelMatch}
                    />

                    <LocationCard
                        location={match.location}
                        latitude={match.latitude}
                        longitude={match.longitude}
                    />

                    <VotingSection
                        isConfirmed={isConfirmed}
                        showVoting={showVoting}
                        myVote={myVote}
                        voteResults={voteResults}
                        confirmedPlayers={confirmedPlayers}
                        currentUserId={currentUser}
                        actionLoading={actionLoading}
                        onShowVoting={() => setShowVoting(true)}
                        onVote={handleVote}
                    />

                    {/* Roster Section */}
                    <section className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Quem vai jogar</h2>
                            <div className="flex items-center gap-2">
                                {isAdmin && confirmedPlayers.length >= 4 && (
                                    <button
                                        onClick={() => setIsTeamGeneratorOpen(true)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">shuffle</span>
                                        Sortear Times
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        const confirmed = confirmedPlayers;
                                        const waitlist = participants.filter(p => p.status === 'waitlist');
                                        const declined = participants.filter(p => p.status === 'declined');

                                        const formatDate = (dateStr: string) => {
                                            const [year, month, day] = dateStr.split('-');
                                            return `${day}/${month}`;
                                        };

                                        let listText = `⚽ *${match.name}* ⚽\n`;
                                        listText += `📅 Data: ${formatDate(match.date)} às ${match.start_time.slice(0, 5)}\n`;
                                        listText += `📍 Local: ${match.location}\n\n`;

                                        listText += `✅ *CONFIRMADOS (${confirmed.length}/${match.capacity})*\n`;
                                        confirmed.forEach((p, index) => {
                                            listText += `${index + 1}. ${p.profile.full_name || 'Jogador'}\n`;
                                        });

                                        if (waitlist.length > 0) {
                                            listText += `\n⌛ *LISTA DE ESPERA*\n`;
                                            waitlist.forEach((p, index) => {
                                                listText += `${index + 1}. ${p.profile.full_name || 'Jogador'}\n`;
                                            });
                                        }

                                        listText += `\n🔗 *Confirme sua presença:*\n${window.location.href}`;

                                        navigator.clipboard.writeText(listText)
                                            .then(() => setSuccessMessage("Lista copiada para o WhatsApp!"))
                                            .catch(() => setErrorMessage("Erro ao copiar lista."));
                                    }}
                                    className="px-4 py-2 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    Copiar Lista
                                </button>
                            </div>
                        </div>

                        <ParticipantsList
                            confirmedPlayers={confirmedPlayers}
                            capacity={match.capacity}
                            onCopyLink={() => {
                                navigator.clipboard.writeText(window.location.href);
                                setSuccessMessage("Link copiado!");
                            }}
                        />
                    </section>
                </div>

                {/* Right Column: Action Card */}
                <div className="lg:col-span-4 relative">
                    <ActionCard
                        isConfirmed={isConfirmed}
                        spotsLeft={spotsLeft}
                        confirmedCount={confirmedPlayers.length}
                        capacity={match.capacity}
                        price={match.price}
                        actionLoading={actionLoading}
                        onJoin={handleJoin}
                        onLeave={handleLeave}
                    />
                </div>
            </div>

            {/* Modals */}
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
                <TeamGeneratorModal
                    isOpen={isTeamGeneratorOpen}
                    onClose={() => setIsTeamGeneratorOpen(false)}
                    players={confirmedPlayers}
                    onSave={handleSaveTeams}
                />
            )}

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
