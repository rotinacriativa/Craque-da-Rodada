"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../../src/lib/client";
import { getResilientUser } from "../../../../../../src/lib/auth-helpers";
import ConfirmationModal from "../../../../../components/ConfirmationModal";

interface Match {
    id: string;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    gender: string;
    capacity: number;
    participants_count?: number; // Calculated
}

export default function GroupMatchesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"upcoming" | "ongoing" | "past">("upcoming");
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Modals
    const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Current User with Multi-Stage Check (Resilient for Mobile)
                const user = await getResilientUser(supabase);

                if (!user) {
                    router.push("/login");
                    return;
                }

                // Fetch matches for this group
                const { data: matchesData, error: matchesError } = await supabase
                    .from("matches")
                    .select(`
                        *,
                        match_participants: match_participants(count)
                    `)
                    .eq("group_id", groupId)
                    .order("date", { ascending: true })
                    .order("start_time", { ascending: true });

                if (matchesError) throw matchesError;

                const processedMatches = (matchesData || []).map((m: any) => ({
                    ...m,
                    participants_count: m.match_participants?.[0]?.count || 0
                }));

                setMatches(processedMatches);

                // Fetch User Role in Group
                const { data: memberData } = await supabase
                    .from("group_members")
                    .select("role")
                    .eq("group_id", groupId)
                    .eq("user_id", user.id)
                    .single();

                if (memberData) {
                    setUserRole(memberData.role);
                }

            } catch (error) {
                console.error("Error fetching matches:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [groupId]);

    const handleDeleteMatch = (match: Match) => {
        setMatchToDelete(match);
    };

    const confirmDeleteMatch = async () => {
        if (!matchToDelete) return;
        setIsDeleting(true);

        try {
            const { error, count } = await supabase
                .from("matches")
                .delete({ count: 'exact' })
                .eq("id", matchToDelete.id);

            if (error) throw error;

            if (count === 0) {
                throw new Error("Permissão negada ou partida não encontrada.");
            }

            setMatches(prev => prev.filter(m => m.id !== matchToDelete.id));
            setMatchToDelete(null);
        } catch (error: any) {
            console.error("Error deleting match:", error);
            alert("Erro ao excluir partida: " + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Filtering logic
    const filteredMatches = matches.filter(match => {
        const now = new Date();
        const startDateTime = new Date(`${match.date}T${match.start_time}`);
        const endDateTime = new Date(`${match.date}T${match.end_time || match.start_time}`);

        if (activeTab === "past") {
            return endDateTime < now;
        } else if (activeTab === "upcoming") {
            return startDateTime > now;
        } else if (activeTab === "ongoing") {
            return startDateTime <= now && endDateTime >= now;
        }
        return false;
    });

    // Formatting helpers
    const formatDate = (dateStr: string, timeStr: string) => {
        const date = new Date(`${dateStr}T${timeStr}`);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + `, ${timeStr.slice(0, 5)}`;
    };

    const isAdmin = userRole === 'admin' || userRole === 'owner';

    return (
        <div className="flex-1 px-6 pb-12 md:px-10 h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestão de Partidas</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Organize suas peladas, controle vagas e gerencie listas.</p>
                    </div>
                    <Link
                        href={`/dashboard/grupos/${groupId}/nova-partida`}
                        className="bg-[#13ec5b] hover:bg-[#0fd652] text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined icon-filled">add_circle</span>
                        Nova Partida
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`px-5 py-2.5 text-sm font-bold -mb-1.5 transition-colors ${activeTab === "upcoming"
                            ? "text-slate-900 dark:text-white border-b-2 border-[#13ec5b]"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Próximas
                    </button>
                    <button
                        onClick={() => setActiveTab("ongoing")}
                        className={`px-5 py-2.5 text-sm font-bold -mb-1.5 transition-colors ${activeTab === "ongoing"
                            ? "text-slate-900 dark:text-white border-b-2 border-[#13ec5b]"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Em andamento
                    </button>
                    <button
                        onClick={() => setActiveTab("past")}
                        className={`px-5 py-2.5 text-sm font-bold -mb-1.5 transition-colors ${activeTab === "past"
                            ? "text-slate-900 dark:text-white border-b-2 border-[#13ec5b]"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Encerradas
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-10 text-center text-slate-500">Carregando partidas...</div>
                    ) : filteredMatches.length === 0 ? (
                        <div className="col-span-full py-10 text-center flex flex-col items-center gap-4">
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                                <span className="material-symbols-outlined text-4xl text-slate-400">sports_soccer_off</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">Nenhuma partida encontrada nesta aba.</p>
                            {activeTab === 'upcoming' && (
                                <Link href={`/dashboard/grupos/${groupId}/nova-partida`} className="text-[#13ec5b] font-bold hover:underline">
                                    Criar nova partida
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredMatches.map(match => {
                            const filled = match.participants_count || 0;
                            const total = match.capacity || 20;
                            const percentage = Math.min(100, (filled / total) * 100);

                            let statusBadge;
                            if (filled >= total) {
                                statusBadge = (
                                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                                        Lista Cheia
                                    </div>
                                );
                            } else if (filled > total * 0.8) {
                                statusBadge = (
                                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        Poucas Vagas
                                    </div>
                                );
                            } else if (filled > 0) {
                                statusBadge = (
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        Confirmada
                                    </div>
                                );
                            } else {
                                statusBadge = (
                                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        Aguardando
                                    </div>
                                );
                            }

                            let barColor = "bg-[#13ec5b]";
                            if (filled >= total) barColor = "bg-red-500";
                            else if (filled > total * 0.8) barColor = "bg-amber-500";

                            return (
                                <div key={match.id} className="bg-white dark:bg-[#1a2c22] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#13ec5b]/20 to-transparent rounded-bl-full -mr-4 -mt-4 z-0"></div>

                                    <div className="flex justify-between items-start mb-4 z-10 relative">
                                        {statusBadge}
                                        <div className="flex gap-1.5">
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteMatch(match);
                                                    }}
                                                    className="p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors border border-red-100 dark:border-red-900/30"
                                                    title="Excluir Partida"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                                                </button>
                                            )}
                                            <div className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-[#13ec5b] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 z-10 relative line-clamp-2">{match.name}</h3>

                                    <div className="flex flex-col gap-3 mb-6 z-10 relative">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                            <span className="material-symbols-outlined text-[#13ec5b] text-[20px]">calendar_month</span>
                                            <span>{formatDate(match.date, match.start_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                            <span className="material-symbols-outlined text-[#13ec5b] text-[20px]">location_on</span>
                                            <span className="truncate">{match.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                            <span className="material-symbols-outlined text-[#13ec5b] text-[20px]">wc</span>
                                            <span className="capitalize">{match.gender || "Misto"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto z-10 relative">
                                        <div className="flex items-center justify-between mb-2 text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">Vagas Preenchidas</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{filled}/{total}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                                            <div className={`${barColor} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/grupos/${groupId}/partidas/${match.id}`} className="flex-1 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-center">
                                                Detalhes
                                            </Link>
                                            <Link href={`/dashboard/grupos/${groupId}/partidas/${match.id}`} className="flex-1 py-2 text-sm font-bold text-[#0fd652] border border-[#13ec5b]/30 hover:bg-[#13ec5b]/5 rounded-lg transition-colors text-center">
                                                Gerenciar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!matchToDelete}
                onClose={() => setMatchToDelete(null)}
                onConfirm={confirmDeleteMatch}
                title="Excluir Partida"
                message={`Tem certeza que deseja excluir a partida "${matchToDelete?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
