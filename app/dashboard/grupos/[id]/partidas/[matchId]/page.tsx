"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../../../src/lib/client";
import { getResilientUser } from "../../../../../../src/lib/auth-helpers";
import ConfirmationModal from "../../../../../components/ConfirmationModal";
import AddPlayerModal from "../../../../../components/AddPlayerModal";
import { formatDateForGroup } from "../../../../../../src/lib/utils";

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
}

interface Participant {
    id: string;
    user_id: string;
    status: string; // 'confirmed', 'waiting', 'invited'
    payment_status: string; // 'paid', 'pending'
    player_type: string; // 'mensalista', 'avulso'
    team?: string;
    profiles: {
        full_name: string;
        position: string;
        avatar_url?: string;
    };
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
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"confirmed" | "waiting" | "invited">("confirmed");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRemovingParticipant, setIsRemovingParticipant] = useState<string | null>(null);
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

    const fetchData = async () => {
        try {
            // 1. Get Current User with Multi-Stage Check (Resilient for Mobile)
            const user = await getResilientUser(supabase);

            if (!user) {
                router.push("/login");
                return;
            }
            setCurrentUser(user);

            // Fetch Match
            const { data: matchData, error: matchError } = await supabase
                .from("matches")
                .select("*")
                .eq("id", matchId)
                .single();

            if (matchError) throw matchError;
            setMatch(matchData);

            // Fetch Participants
            const { data: participantsData, error: participantsError } = await supabase
                .from("match_participants")
                .select(`
                    id,
                    user_id,
                    status,
                    player_type,
                    team,
                    profiles (
                        full_name,
                        position,
                        avatar_url
                    ),
                    payments:payments!match_id(
                        id,
                        status,
                        amount
                    )
                `)
                .eq("match_id", matchId);

            if (participantsError) throw participantsError;
            setParticipants(participantsData as any);

            // Fetch User Role in Group
            const { data: memberData } = await supabase
                .from("group_members")
                .select("role")
                .eq("group_id", matchData.group_id)
                .eq("user_id", user.id)
                .single();

            if (memberData) {
                setUserRole(memberData.role);
            }

        } catch (error: any) {
            console.error("Error fetching match data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
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
        } catch (error: any) {
            console.error("Error removing participant:", error);
            alert("Erro ao remover jogador: " + error.message);
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
        } catch (error) {
            console.error("Error marking as paid:", error);
            alert("Erro ao confirmar pagamento.");
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

            if (count === 0) {
                throw new Error("Permissão negada ou partida não encontrada.");
            }

            alert("Partida excluída com sucesso.");
            router.push(`/dashboard/grupos/${groupId}/admin/partidas`);
        } catch (error: any) {
            console.error("Error deleting match:", error);
            alert("Erro ao excluir partida: " + error.message);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center text-slate-500">Carregando detalhes da partida...</div>;
    }

    if (!match) {
        return <div className="flex-1 flex items-center justify-center text-slate-500">Partida não encontrada.</div>;
    }

    // Calculations
    const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
    const waitingPlayers = participants.filter(p => p.status === 'waiting');
    const invitedPlayers = participants.filter(p => p.status === 'invited');

    const pendingPayments = confirmedPlayers.filter(p => {
        const payment = p.payments?.[0];
        return payment && payment.status === 'PENDENTE';
    }).length;

    const displayedPlayers = activeTab === 'confirmed' ? confirmedPlayers : activeTab === 'waiting' ? waitingPlayers : invitedPlayers;

    // Format Date
    const formattedDate = new Date(`${match.date}T${match.start_time}`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });

    // Status Badge Logic
    const filled = confirmedPlayers.length;
    const total = match.capacity || 20;

    let statusBadge = (
        <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            Aguardando
        </div>
    );

    if (filled >= total) {
        statusBadge = (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                Lista Cheia
            </div>
        );
    } else if (filled > 0) {
        statusBadge = (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Confirmada
            </div>
        );
    }

    // Helper for initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const isAdmin = userRole === 'admin' || userRole === 'owner';

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
                    {/* Title & Info */}
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
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px] text-[#13ec5b]">location_on</span>
                                    <span>{match.location}</span>
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={handleDeleteMatch}
                                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm border border-red-100 dark:border-red-900/30"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                                Excluir Partida
                            </button>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Confirmados</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{confirmedPlayers.length}</span>
                                    <span className="text-sm font-medium text-slate-400">/ {match.capacity}</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#13ec5b]">
                                <span className="material-symbols-outlined icon-filled">group</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Lista de Espera</p>
                                <span className="text-3xl font-black text-slate-900 dark:text-white">{waitingPlayers.length}</span>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500">
                                <span className="material-symbols-outlined icon-filled">hourglass_top</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2c22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Pagamentos Pendentes</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-red-500">{pendingPayments}</span>
                                    <span className="text-sm font-medium text-slate-400">jogadores</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined icon-filled">payments</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Tabs */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full lg:w-auto overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('confirmed')}
                                className={`flex-1 lg:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'confirmed' ? 'text-slate-900 dark:text-white bg-white dark:bg-[#1a2c22] shadow-sm border border-slate-200/50 dark:border-slate-700' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                Confirmados ({confirmedPlayers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('waiting')}
                                className={`flex-1 lg:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'waiting' ? 'text-slate-900 dark:text-white bg-white dark:bg-[#1a2c22] shadow-sm border border-slate-200/50 dark:border-slate-700' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                Espera ({waitingPlayers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('invited')}
                                className={`flex-1 lg:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'invited' ? 'text-slate-900 dark:text-white bg-white dark:bg-[#1a2c22] shadow-sm border border-slate-200/50 dark:border-slate-700' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                Convidados ({invitedPlayers.length})
                            </button>

                        </div>
                        <div className="flex gap-3 w-full lg:w-auto">
                            <button className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm transition-colors">
                                <span className="material-symbols-outlined">shuffle</span>
                                Sortear Times
                            </button>
                            <button
                                onClick={() => setIsAddPlayerOpen(true)}
                                className="flex-1 lg:flex-none bg-[#13ec5b] hover:bg-[#0fd652] text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm"
                            >
                                <span className="material-symbols-outlined icon-filled">person_add</span>
                                Adicionar Jogador
                            </button>
                        </div>
                    </div>

                    {/* Table */}
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
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                Nenhum jogador encontrado nesta lista.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedPlayers.map((player) => (
                                            <tr key={player.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm overflow-hidden">
                                                            {player.profiles?.avatar_url ? (
                                                                <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                getInitials(player.profiles?.full_name || "Desconhecido")
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{player.profiles?.full_name || "Jogador Removido"}</span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">{player.profiles?.position || "Sem posição"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${player.player_type === 'mensalista'
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                        }`}>
                                                        {player.player_type || 'Diarista'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(() => {
                                                        const payment = player.payments?.find(p => p.status === 'PAGO' || p.status === 'PENDENTE');
                                                        if (!payment) return (
                                                            <span className="text-xs text-slate-400">Isento/Mensalista</span>
                                                        );

                                                        if (payment.status === 'PAGO') {
                                                            return (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                    Pago
                                                                </span>
                                                            );
                                                        }

                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                                    Pendente
                                                                </span>
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => handleMarkAsPaid(payment.id)}
                                                                        className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                                                        title="Marcar como Pago"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 rounded-lg text-slate-400 hover:text-[#13ec5b] hover:bg-[#13ec5b]/10 transition-colors" title="Notificar">
                                                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleRemoveParticipant(player.id)}
                                                                disabled={isRemovingParticipant === player.id}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                                title="Remover"
                                                            >
                                                                {isRemovingParticipant === player.id ? (
                                                                    <span className="size-5 border-2 border-red-500 border-r-transparent rounded-full animate-spin"></span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
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

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteMatch}
                title="Excluir Partida"
                message={`Tem certeza que deseja excluir a partida "${match.name}"? Esta ação não pode ser desfeita e removerá todos os jogadores confirmados.`}
                confirmText="Excluir Definitivamente"
                cancelText="Cancelar"
                type="danger"
                isLoading={isDeleting}
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
