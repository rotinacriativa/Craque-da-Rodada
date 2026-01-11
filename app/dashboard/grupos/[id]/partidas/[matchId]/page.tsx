"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../../../src/lib/client";
import { getResilientUser } from "../../../../../../src/lib/auth-helpers";
import ConfirmationModal from "../../../../../components/ConfirmationModal";
import AddPlayerModal from "../../../../../components/AddPlayerModal";
import TeamGeneratorModal from "../../../../../components/TeamGeneratorModal";
import { toast } from "sonner";

interface Match {
    id: string;
    group_id: string;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity: number;
    description?: string;
    status: 'scheduled' | 'ongoing' | 'finished' | 'cancelled';
    score_a?: number;
    score_b?: number;
    mvp_id?: string;
}

interface Participant {
    id: string;
    user_id: string | null;
    status: string; // 'confirmed', 'waiting', 'invited'
    player_type: string; // 'mensalista', 'avulso'
    team?: string;
    guest_name?: string;
    guest_position?: string;
    guest_skill_level?: number;
    profiles: {
        full_name: string;
        position: string;
        avatar_url?: string;
        skill_level?: number; // Added skill_level to profile
    } | null;
    payments?: {
        id: string;
        status: string;
        amount: number;
    }[];
}

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string; matchId: string }> }) {
    const { id, matchId } = use(params);
    const groupId = id;
    const router = useRouter();

    const [match, setMatch] = useState<Match | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"confirmed" | "waiting" | "invited">("confirmed");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRemovingParticipant, setIsRemovingParticipant] = useState<string | null>(null);
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [isTeamGeneratorOpen, setIsTeamGeneratorOpen] = useState(false);

    const fetchData = async () => {
        try {
            const user = await getResilientUser(supabase);
            if (!user) {
                router.push("/login");
                return;
            }
            setCurrentUser(user);

            const { data: matchData, error: matchError } = await supabase
                .from("matches")
                .select("*")
                .eq("id", matchId)
                .single();

            if (matchError) throw matchError;
            setMatch(matchData);

            // Fetch Participants - Try with guest columns, fallback if migration hasn't run
            let participantsData, participantsError;

            const guestQuery = await supabase
                .from("match_participants")
                .select(`
                    id,
                    user_id,
                    status,
                    player_type,
                    team,
                    guest_name,
                    guest_position,
                    guest_skill_level
                `)
                .eq("match_id", matchId);

            if (guestQuery.error && (guestQuery.error.message.includes('column') || guestQuery.error.code === 'PGRST204')) {
                console.warn("Guest columns missing, falling back to basic query");
                const basicQuery = await supabase
                    .from("match_participants")
                    .select(`
                        id,
                        user_id,
                        status,
                        player_type,
                        team
                    `)
                    .eq("match_id", matchId);
                participantsData = basicQuery.data;
                participantsError = basicQuery.error;
            } else {
                participantsData = guestQuery.data;
                participantsError = guestQuery.error;
            }

            if (participantsError) throw participantsError;

            // Fetch Profiles separately
            let profilesMap: Record<string, any> = {};
            const userIdsForProfiles = participantsData?.filter(p => p.user_id).map(p => p.user_id) || [];

            if (userIdsForProfiles.length > 0) {
                try {
                    const { data: profilesData, error: profilesError } = await supabase
                        .from("profiles")
                        .select("id, full_name, position, avatar_url, skill_level")
                        .in("id", userIdsForProfiles);

                    if (!profilesError && profilesData) {
                        profilesData.forEach((profile: any) => {
                            profilesMap[profile.id] = profile;
                        });
                    }
                } catch (err) {
                    console.warn("Could not fetch profiles:", err);
                }
            }

            // Fetch Payments separately
            let paymentsMap: Record<string, any[]> = {};
            const userIdsForPayments = participantsData?.filter(p => p.user_id).map(p => p.user_id) || [];

            if (userIdsForPayments.length > 0) {
                try {
                    const { data: paymentsData, error: paymentsError } = await supabase
                        .from("payments")
                        .select("id, status, amount, user_id")
                        .eq("match_id", matchId)
                        .in("user_id", userIdsForPayments);

                    if (!paymentsError && paymentsData) {
                        paymentsData.forEach((payment: any) => {
                            if (!paymentsMap[payment.user_id]) {
                                paymentsMap[payment.user_id] = [];
                            }
                            paymentsMap[payment.user_id].push(payment);
                        });
                    }
                } catch (err) {
                    console.warn("Could not fetch payments:", err);
                }
            }

            const combinedParticipants = participantsData?.map((p: any) => ({
                ...p,
                profiles: p.user_id ? profilesMap[p.user_id] : null,
                payments: p.user_id ? (paymentsMap[p.user_id] || []) : []
            })) || [];

            setParticipants(combinedParticipants);

            const { data: memberData } = await supabase
                .from("group_members")
                .select("role")
                .eq("group_id", matchData.group_id)
                .eq("user_id", user.id)
                .single();

            if (memberData) {
                setUserRole(memberData.role);
            }

            // Fetch Match Events for Finished matches
            if (matchData.status === 'finished') {
                const { data: eventsData } = await supabase
                    .from('match_events')
                    .select('*')
                    .eq('match_id', matchId)
                    .order('created_at', { ascending: true });

                setEvents(eventsData || []);
            }
        } catch (error: any) {
            console.error("Error details:", error.message || error);
            toast.error("Erro ao carregar dados. Verifique o console.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (matchId) {
            fetchData();
        }
    }, [matchId]);

    const handleRemoveParticipant = async (participantId: string) => {
        if (!isAdmin) return;
        if (!confirm("Remover este jogador da partida?")) return;

        setIsRemovingParticipant(participantId);
        try {
            const { error } = await supabase
                .from("match_participants")
                .delete()
                .eq("id", participantId);

            if (error) throw error;
            await fetchData();
            toast.success("Jogador removido com sucesso");
        } catch (error: any) {
            console.error("Error details:", error.message || error);
            toast.error("Erro ao carregar dados. Verifique o console.");
        } finally {
            setIsRemovingParticipant(null);
        }
    };

    const handleMarkAsPaid = async (paymentId: string) => {
        if (!isAdmin) return;
        try {
            const { error } = await supabase
                .from('payments')
                .update({ status: 'PAGO', paid_at: new Date().toISOString() })
                .eq('id', paymentId);

            if (error) throw error;
            await fetchData();
            toast.success("Pagamento confirmado!");
        } catch (error) {
            console.error("Error marking as paid:", error);
            toast.error("Erro ao confirmar pagamento.");
        }
    };

    const handleDeleteMatch = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteMatch = async () => {
        setIsDeleting(true);
        try {
            const { error, count } = await supabase
                .from("matches")
                .delete({ count: 'exact' })
                .eq("id", matchId);

            if (error) throw error;
            if (count === 0) throw new Error("Permissão negada ou partida não encontrada.");

            toast.success("Partida excluída com sucesso.");
            router.push(`/dashboard/grupos/${groupId}/admin/partidas`);
        } catch (error: any) {
            console.error("Error deleting match:", error);
            toast.error("Erro ao excluir partida.");
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleSaveTeams = async (teamsMap: { teamA: string[], teamB: string[], teamC: string[], teamD: string[] }) => {
        try {
            const updates: any[] = [];
            const queueUpdate = (ids: string[], teamName: string) => {
                ids.forEach(id => {
                    updates.push(supabase.from('match_participants').update({ team: teamName }).eq('id', id));
                });
            };

            queueUpdate(teamsMap.teamA, 'A');
            queueUpdate(teamsMap.teamB, 'B');
            queueUpdate(teamsMap.teamC, 'C');
            queueUpdate(teamsMap.teamD, 'D');

            await Promise.all(updates);
            toast.success("Times salvos com sucesso!");
            fetchData();
            setIsTeamGeneratorOpen(false);
        } catch (error) {
            console.error("Error saving teams:", error);
            toast.error("Erro ao salvar times.");
        }
    };

    const handleCopyList = () => {
        if (!match) return;
        const confirmed = confirmedPlayers;
        const waiting = waitingPlayers;

        const formatDate = (dateStr: string) => {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}`;
        };

        let listText = `⚽ *${match.name}* ⚽\n`;
        listText += `📅 Data: ${formatDate(match.date)} às ${match.start_time.slice(0, 5)}\n`;
        listText += `📍 Local: ${match.location}\n\n`;

        const hasTeams = confirmed.some(p => p.team);

        if (hasTeams) {
            ['A', 'B', 'C', 'D'].forEach(teamLetter => {
                const teamPlayers = confirmed.filter(p => p.team === teamLetter);
                if (teamPlayers.length > 0) {
                    listText += `👕 *TIME ${teamLetter}* (${teamPlayers.length})\n`;
                    teamPlayers.forEach((p, index) => {
                        const pos = p.profiles?.position || p.guest_position || "";
                        listText += `${index + 1}. ${p.profiles?.full_name || p.guest_name}${pos ? ` (${pos})` : ''}\n`;
                    });
                    listText += `\n`;
                }
            });
        } else {
            listText += `✅ *CONFIRMADOS (${confirmed.length}/${match.capacity})*\n`;
            confirmed.forEach((p, index) => {
                const pos = p.profiles?.position || p.guest_position || "";
                listText += `${index + 1}. ${p.profiles?.full_name || p.guest_name}${pos ? ` (${pos})` : ''}\n`;
            });
        }

        if (waiting.length > 0) {
            listText += `\n⌛ *LISTA DE ESPERA*\n`;
            waiting.forEach((p, index) => {
                const pos = p.profiles?.position || p.guest_position || "";
                listText += `${index + 1}. ${p.profiles?.full_name || p.guest_name}${pos ? ` (${pos})` : ''}\n`;
            });
        }

        const appUrl = window.location.origin;
        listText += `\n🔗 *Confirme sua presença:*\n${appUrl}/dashboard/partidas/${match.id}`;

        navigator.clipboard.writeText(listText)
            .then(() => toast.success("Lista copiada!"))
            .catch(() => toast.error("Erro ao copiar."));
    };

    const handleAddBots = async () => {
        if (!confirm("Isso adicionará 14 jogadores fictícios para teste. Continuar?")) return;

        const bots = [
            { name: "João Silva", pos: "Meia" }, { name: "Pedro Santos", pos: "Atacante" },
            { name: "Lucas Oliveira", pos: "Zagueiro" }, { name: "Mateus Costa", pos: "Goleiro" },
            { name: "Gabriel Souza", pos: "Meia" }, { name: "Rafael Lima", pos: "Atacante" },
            { name: "Bruno Pereira", pos: "Zagueiro" }, { name: "Leonardo Alves", pos: "Goleiro" },
            { name: "Daniel Ferreira", pos: "Lateral" }, { name: "Thiago Rocha", pos: "Lateral" },
            { name: "Felipe Ribeiro", pos: "Volante" }, { name: "Rodrigo Martins", pos: "Volante" },
            { name: "André Almeida", pos: "Meia" }, { name: "Fernando Carvalho", pos: "Atacante" }
        ];

        try {
            const inserts = bots.map(bot => ({
                match_id: matchId,
                status: 'confirmed',
                player_type: 'avulso',
                guest_name: bot.name,
                guest_position: bot.pos,
                guest_skill_level: 3 + (Math.random() * 2),
                user_id: null
            }));

            const { error } = await supabase.from('match_participants').insert(inserts);
            if (error) throw error;
            toast.success("Bots adicionados com sucesso!");
            fetchData();
        } catch (error: any) {
            console.error("Error adding bots:", error);
            toast.error("Erro ao adicionar bots.");
        }
    };

    if (isLoading) return <MatchDetailsSkeleton />;
    if (!match) return <div className="flex-1 flex items-center justify-center text-slate-500">Partida não encontrada.</div>;

    const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
    const waitingPlayers = participants.filter(p => p.status === 'waiting');
    const invitedPlayers = participants.filter(p => p.status === 'invited');
    const pendingPayments = confirmedPlayers.filter(p => p.payments?.[0]?.status === 'PENDENTE').length;
    const displayedPlayers = activeTab === 'confirmed' ? confirmedPlayers : activeTab === 'waiting' ? waitingPlayers : invitedPlayers;

    if (activeTab === 'confirmed' && confirmedPlayers.some(p => p.team)) {
        displayedPlayers.sort((a, b) => (a.team || 'Z').localeCompare(b.team || 'Z'));
    }

    const formattedDate = new Date(`${match.date}T${match.start_time}`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
    const isAdmin = userRole === 'admin' || userRole === 'owner';
    const filled = confirmedPlayers.length;
    const total = match.capacity || 20;

    const statusBadge = match.status === 'finished' ? (
        <div className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-lg border border-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>Encerrada
        </div>
    ) : filled >= total ? (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 uppercase tracking-wider">Lista Cheia</div>
    ) : filled > 0 ? (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 uppercase tracking-wider font-display">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse"></span>Confirmada
        </div>
    ) : (
        <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-wider">Aguardando</div>
    );

    const getInitials = (name: string) => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 bg-[#f6f8f6] dark:bg-[#102216]">
            <header className="w-full px-6 py-5 md:px-10 md:py-8">
                <div className="max-w-6xl mx-auto w-full">
                    <nav className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href="/dashboard">Dashboard</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href={`/dashboard/grupos/${groupId}/admin/partidas`}>Partidas</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium bg-white dark:bg-[#1a2c22] px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">{match.name}</span>
                    </nav>
                </div>
            </header>

            <div className="flex-1 px-6 pb-12 md:px-10">
                <div className="max-w-6xl mx-auto w-full flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{match.name}</h2>
                                {statusBadge}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px] text-[#13ec5b]">calendar_month</span>
                                    <span>{formattedDate}</span>
                                </div>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#13ec5b] transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-[#13ec5b]">location_on</span>
                                    <span>{match.location}</span>
                                </a>
                            </div>
                        </div>
                        {isAdmin && (
                            <button onClick={handleDeleteMatch} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm border border-red-100 dark:border-red-900/30">
                                <span className="material-symbols-outlined text-[20px]">delete_forever</span>Excluir Partida
                            </button>
                        )}
                    </div>

                    {/* Finished Match Summary Card */}
                    {match.status === 'finished' && (
                        <div className="bg-white dark:bg-[#1a2c22] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-10">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                                <div className="relative flex flex-col items-center gap-6">
                                    <span className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">Resultado Final</span>

                                    <div className="flex items-center justify-between w-full max-w-lg">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-black text-3xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">A</div>
                                            <span className="text-sm font-bold text-slate-300">Time Azul</span>
                                        </div>

                                        <div className="flex items-center gap-6 text-700 text-6xl font-black font-display tracking-tighter">
                                            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{match.score_a || 0}</span>
                                            <span className="text-slate-600 italic text-2xl">vs</span>
                                            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{match.score_b || 0}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-16 bg-white/5 rounded-2xl border-2 border-white/10 flex items-center justify-center text-slate-300 font-black text-3xl">B</div>
                                            <span className="text-sm font-bold text-slate-300">Time Branco</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-yellow-400">
                                            <span className="material-symbols-outlined text-2xl filled">emoji_events</span>
                                            <span className="font-black italic text-lg uppercase tracking-tight">Partida Encerrada</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Goals/Events Timeline */}
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 dark:bg-[#1a2c22]/50">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Eventos do Jogo
                                    </h4>
                                    <div className="space-y-4">
                                        {events.map((event, i) => {
                                            const player = participants.find(p => p.id === event.player_id);
                                            const assister = event.assist_id ? participants.find(p => p.id === event.assist_id) : null;
                                            return (
                                                <div key={event.id} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <span className="text-xs font-mono text-slate-400 mt-1">{event.event_time}</span>
                                                    <div className="flex-1 flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[18px] text-yellow-500 filled">
                                                                {event.type === 'goal' ? 'sports_soccer' : event.type === 'card_yellow' ? 'square' : 'square'}
                                                            </span>
                                                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                                {player?.profiles?.full_name || player?.guest_name || "Jogador"}
                                                            </span>
                                                            {event.type === 'goal' && <span className="text-xs font-black text-emerald-500">GOL!</span>}
                                                        </div>
                                                        {assister && (
                                                            <p className="text-[11px] text-slate-500 font-medium ml-6 italic">Assist: {assister.profiles?.full_name || assister.guest_name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {events.length === 0 && (
                                            <p className="text-sm text-slate-400 italic">Nenhum evento registrado nesta partida.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a2c22] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col justify-center items-center gap-4">
                                    <span className="material-symbols-outlined text-4xl text-yellow-500 filled">stars</span>
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Destaque da Rodada</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">Eleito pela Galera</p>
                                    </div>
                                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                                    <p className="text-sm text-center text-slate-500 leading-relaxed font-medium">
                                        A resenha está liberada! Veja os números da partida e compartilhe com o grupo. 🍻⚽
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Confirmados</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{confirmedPlayers.length}</span>
                                    <span className="text-sm font-medium text-slate-400">/ {match.capacity}</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#13ec5b]"><span className="material-symbols-outlined icon-filled">group</span></div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Lista de Espera</p>
                                <span className="text-3xl font-black text-slate-900 dark:text-white">{waitingPlayers.length}</span>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500"><span className="material-symbols-outlined icon-filled">hourglass_top</span></div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Pagamentos Pendentes</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-red-500">{pendingPayments}</span>
                                    <span className="text-sm font-medium text-slate-400">jogadores</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500"><span className="material-symbols-outlined icon-filled">payments</span></div>
                        </div>
                    </div>

                    {/* Start Live Match CTA - Shows when teams are sorted */}
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        {confirmedPlayers.some(p => p.team) ? (
                            <div className="bg-gradient-to-br from-[#13ec5b] to-[#0fd652] rounded-3xl p-8 shadow-2xl shadow-[#13ec5b]/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>

                                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col items-center md:items-start text-slate-900 border-l-4 border-slate-900/10 pl-4">
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Times Definidos!</h3>
                                        <p className="font-bold opacity-80">Pronto para iniciar a pelada e marcar os gols?</p>
                                    </div>

                                    <Link
                                        href={`/dashboard/partidas/${matchId}/em-andamento`}
                                        className="w-full md:w-auto px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
                                    >
                                        <span className="material-symbols-outlined text-[28px] icon-filled">sports_score</span>
                                        ABRIR SÚMULA AO VIVO
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-[40px] text-slate-400">person_add</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum jogador confirmado</h3>
                                <p className="text-slate-500 text-center max-w-sm px-6 mb-8">
                                    Compartilhe o link do grupo ou adicione jogadores manualmente para começar o sorteio.
                                </p>

                                {isAdmin && (
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsAddPlayerOpen(true)} className="px-6 py-3 bg-[#13ec5b] text-[#0d1b12] font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#13ec5b]/20">
                                            Adicionar Jogador
                                        </button>
                                        <button onClick={handleAddBots} title="Adicionar Bots para Teste" className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">
                                            <span className="material-symbols-outlined">smart_toy</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full lg:w-auto overflow-x-auto">
                            {(['confirmed', 'waiting', 'invited'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 lg:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'text-slate-900 dark:text-white bg-white dark:bg-[#1a2c22] shadow-sm border border-slate-200/50 dark:border-slate-700' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                                    {tab === 'confirmed' ? 'Confirmados' : tab === 'waiting' ? 'Espera' : 'Convidados'} ({tab === 'confirmed' ? confirmedPlayers.length : tab === 'waiting' ? waitingPlayers.length : invitedPlayers.length})
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                            {isAdmin && (
                                <>
                                    {activeTab === 'confirmed' && (
                                        <>
                                            <button onClick={handleCopyList} className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm transition-colors">
                                                <span className="material-symbols-outlined">content_copy</span>Copiar Lista
                                            </button>
                                            <button onClick={() => setIsTeamGeneratorOpen(true)} className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm transition-colors">
                                                <span className="material-symbols-outlined">shuffle</span>Sortear
                                            </button>
                                        </>
                                    )}
                                    {participants.length === 0 && (
                                        <button onClick={handleAddBots} className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm transition-colors" title="Adicionar jogadores teste">
                                            <span className="material-symbols-outlined transition-transform hover:rotate-180">smart_toy</span>Bots
                                        </button>
                                    )}
                                    <button onClick={() => setIsAddPlayerOpen(true)} className="flex-1 lg:flex-none bg-[#13ec5b] hover:bg-[#0fd652] text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm">
                                        <span className="material-symbols-outlined icon-filled">person_add</span>Add
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a2c22] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jogador</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Pagamento</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {displayedPlayers.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum jogador encontrado nesta lista.</td></tr>
                                    ) : (
                                        displayedPlayers.map((player) => (
                                            <tr key={player.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${player.team ? 'bg-slate-50/30' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm overflow-hidden">
                                                                {player.profiles?.avatar_url ? <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(player.profiles?.full_name || player.guest_name || "?")}
                                                            </div>
                                                            {player.team && (
                                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-[#102216] ${player.team === 'A' ? 'bg-blue-500 text-white' : player.team === 'B' ? 'bg-red-500 text-white' : player.team === 'C' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>{player.team}</div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{player.profiles?.full_name || player.guest_name} {!player.user_id && <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">Conv.</span>}</span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">{player.profiles?.position || player.guest_position || "Jogador"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${player.player_type === 'mensalista' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>{player.player_type || 'Avulso'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(() => {
                                                        const payment = player.payments?.find(p => p.status === 'PAGO' || p.status === 'PENDENTE');
                                                        if (!payment) return <span className="text-xs text-slate-400">Isento</span>;
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${payment.status === 'PAGO' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${payment.status === 'PAGO' ? 'bg-green-500' : 'bg-red-500'}`}></span>{payment.status === 'PAGO' ? 'Pago' : 'Pendente'}
                                                                </span>
                                                                {isAdmin && payment.status === 'PENDENTE' && <button onClick={() => handleMarkAsPaid(payment.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"><span className="material-symbols-outlined text-[16px]">check</span></button>}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {isAdmin && <button onClick={() => handleRemoveParticipant(player.id)} disabled={isRemovingParticipant === player.id} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[20px]">{isRemovingParticipant === player.id ? "refresh" : "delete"}</span></button>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteMatch} title="Excluir Partida" message="Tem certeza que deseja excluir esta partida?" confirmText="Excluir" cancelText="Cancelar" type="danger" isLoading={isDeleting} />
            {match && <AddPlayerModal isOpen={isAddPlayerOpen} onClose={() => setIsAddPlayerOpen(false)} matchId={matchId} groupId={match.group_id} existingPlayerIds={participants.filter(p => p.user_id).map(p => p.user_id as string)} onAdd={fetchData} />}
            {match && <TeamGeneratorModal isOpen={isTeamGeneratorOpen} onClose={() => setIsTeamGeneratorOpen(false)} players={confirmedPlayers.map(p => ({ ...p, profile: { full_name: p.profiles?.full_name || p.guest_name || "Jogador", position: p.profiles?.position || p.guest_position || "Jogador", avatar_url: p.profiles?.avatar_url || null, skill_level: (p as any).guest_skill_level || (p.profiles as any)?.skill_level || 3 } }))} onSave={handleSaveTeams} />}
        </div>
    );
}

// 🦴 Premium Skeleton Component
function MatchDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1612] p-4 md:p-8 animate-pulse text-transparent select-none">
            <div className="max-w-7xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                        <div className="h-4 w-96 bg-slate-50 dark:bg-slate-900 rounded-lg" />
                        <div className="h-4 w-80 bg-slate-50 dark:bg-slate-900 rounded-lg" />
                    </div>
                    <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                        <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl ml-auto" />
                    </div>
                    <div className="h-[400px] bg-slate-50 dark:bg-slate-900 rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
