"use client";

import { use, useState, useEffect } from "react";
import { supabase } from "../../../../../../src/lib/client";
import { AddPlayerModal } from "./AddPlayerModal";
import { toast } from "sonner";

interface Member {
    id: string; // group_member id
    user_id: string | null;
    role: string;
    status: string; // 'active', 'pending', 'banned'
    payment_type: 'MENSALISTA' | 'DIARISTA' | 'CONVIDADO';
    monthly_price_override: number | null;
    joined_at: string;
    is_manual?: boolean;
    manual_name?: string;
    manual_position?: string;
    manual_skill_level?: string;
    manual_notes?: string;
    profiles: {
        full_name: string;
        position: string;
        skill_level: string;
        avatar_url: string | null;
        email?: string;
        is_manual?: boolean;
    } | null;
}

export default function PlayersAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("Todos os tipos");
    const [statusFilter, setStatusFilter] = useState("Status: Todos");
    const [errorMsg, setErrorMsg] = useState("");

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    async function fetchMembers() {
        try {
            setIsLoading(true);
            // 1. Fetch Members
            const { data: membersData, error: membersError } = await supabase
                .from("group_members")
                .select('*')
                .eq("group_id", groupId)
                .order('is_manual', { ascending: true }) // Real users first? or Manual first? Let's just default sort
                .order('joined_at', { ascending: false });

            if (membersError) throw membersError;

            if (!membersData || membersData.length === 0) {
                setMembers([]);
                setIsLoading(false);
                return;
            }

            // 2. Fetch Profiles for real users
            const userIds = membersData
                .filter((m: any) => m.user_id && !m.is_manual)
                .map((m: any) => m.user_id);

            let profilesMap = new Map();

            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from("profiles")
                    .select('id, full_name, position, skill_level, avatar_url')
                    .in('id', userIds);

                if (profilesError) throw profilesError;
                profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]));
            }

            // 3. Merge Data
            const mergedMembers = membersData.map((member: any) => {
                if (member.is_manual) {
                    return {
                        ...member,
                        profiles: {
                            full_name: member.manual_name || "Jogador Manual",
                            position: member.manual_position || "—",
                            skill_level: member.manual_skill_level || "3",
                            avatar_url: null,
                            is_manual: true
                        }
                    };
                }

                return {
                    ...member,
                    profiles: profilesMap.get(member.user_id) || null
                };
            });

            setMembers(mergedMembers);

        } catch (error: any) {
            console.error("Error fetching members:", error);
            const message = error.message || String(error);
            setErrorMsg(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (groupId) fetchMembers();
    }, [groupId]);

    const handleUpdatePaymentType = async (memberId: string, newType: string) => {
        try {
            const { error } = await supabase
                .from('group_members')
                .update({ payment_type: newType })
                .eq('id', memberId);

            if (error) throw error;

            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, payment_type: newType as any } : m));
            toast.success("Tipo atualizado!");
        } catch (error) {
            console.error("Error updating payment type:", error);
            toast.error("Erro ao atualizar tipo de pagamento.");
        }
    };

    // Stats
    const totalPlayers = members.length;
    const mensalistas = members.filter(m => m.payment_type === 'MENSALISTA').length;
    const diaristas = members.filter(m => m.payment_type === 'DIARISTA').length;
    const convidados = members.filter(m => m.payment_type === 'CONVIDADO').length;

    // Filtering
    const filteredMembers = members.filter(member => {
        const name = member.profiles?.full_name?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        const matchesSearch = name.includes(search);

        const matchesType = typeFilter === "Todos os tipos"
            ? true
            : typeFilter === "Mensalistas"
                ? member.payment_type === 'MENSALISTA'
                : typeFilter === "Diaristas"
                    ? member.payment_type === 'DIARISTA'
                    : member.payment_type === 'CONVIDADO';

        const matchesStatus = statusFilter === "Status: Todos"
            ? true
            : statusFilter === "Ativo"
                ? member.status === 'active'
                : statusFilter === "Pendente"
                    ? member.status === 'pending'
                    : member.status === 'banned';

        return matchesSearch && matchesType && matchesStatus;
    });

    // Helper: Stars from Skill Level
    const renderStars = (skill: string) => {
        let level = 3;
        const s = skill?.toLowerCase() || "";
        if (s.includes('iniciante') || s === "1") level = 1;
        if (s.includes('medio') || s === "2") level = 2;
        if (s.includes('intermediário') || s === "3") level = 3;
        if (s.includes('avançado') || s === "4") level = 4;
        if (s.includes('profissional') || s.includes('craque') || s === "5") level = 5;

        return (
            <div className="flex text-amber-400 text-[18px]" title={skill}>
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined icon-filled ${i < level ? "" : "text-slate-300 dark:text-slate-600"}`}>
                        star
                    </span>
                ))}
            </div>
        );
    };

    const getInitials = (name: string) => {
        return (name || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    };

    return (
        <div className="flex-1 px-6 pb-12 md:px-10 h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestão de Jogadores</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Gerencie seu elenco, organize mensalistas e mantenha o cadastro atualizado.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#13ec5b] hover:bg-[#0fd652] text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined icon-filled">person_add</span>
                        Adicionar Jogador
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#1a2c22] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined icon-filled">groups</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Jogadores</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalPlayers}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2c22] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <span className="material-symbols-outlined icon-filled">verified</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mensalistas</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{mensalistas}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2c22] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined icon-filled">sports_soccer</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Diaristas</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{diaristas}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2c22] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined icon-filled">person_celebrate</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Convidados</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{convidados}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </span>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
                            placeholder="Buscar por nome, email ou apelido..."
                            type="text"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none"
                        >
                            <option>Todos os tipos</option>
                            <option>Mensalistas</option>
                            <option>Diaristas</option>
                            <option>Convidados</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none"
                        >
                            <option>Status: Todos</option>
                            <option>Ativo</option>
                            <option>Pendente</option>
                            <option>Inativo</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jogador</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tipo</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Posição</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nível Técnico</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">Carregando jogadores...</td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            Nenhum jogador encontrado.<br />
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map(member => (
                                        <tr key={member.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                                                        {member.profiles?.avatar_url ? (
                                                            <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                                                                {getInitials(member.profiles?.full_name || "Desconhecido")}
                                                            </span>
                                                        )}
                                                        {member.is_manual && (
                                                            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center" title="Jogador Manual">
                                                                <span className="material-symbols-outlined text-[14px] text-white font-bold opacity-80">edit_note</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-900 dark:text-white">{member.profiles?.full_name || "Usuário não encontrado"}</p>
                                                            {member.is_manual && (
                                                                <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Manual</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            {member.is_manual ? "Sem conta vinculada" : "Membro registrado"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={member.payment_type}
                                                    onChange={(e) => handleUpdatePaymentType(member.id, e.target.value)}
                                                    className={`text-xs font-bold border rounded-full px-2 py-0.5 outline-none cursor-pointer transition-colors ${member.payment_type === 'MENSALISTA'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                        : member.payment_type === 'DIARISTA'
                                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                                                        }`}
                                                >
                                                    <option value="DIARISTA">Diarista</option>
                                                    <option value="MENSALISTA">Mensalista</option>
                                                    <option value="CONVIDADO">Convidado</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {member.profiles?.position || "—"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {renderStars(member.profiles?.skill_level || "")}
                                            </td>
                                            <td className="p-4">
                                                <div className={`flex items-center gap-1.5 text-sm font-medium ${member.status === 'active'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : member.status === 'pending'
                                                        ? 'text-slate-500 dark:text-slate-400'
                                                        : 'text-red-500 dark:text-red-400'
                                                    }`}>
                                                    <span className={`h-2 w-2 rounded-full ${member.status === 'active'
                                                        ? 'bg-emerald-500'
                                                        : member.status === 'pending'
                                                            ? 'bg-slate-300 dark:bg-slate-500'
                                                            : 'bg-red-500'
                                                        }`}></span>
                                                    {member.status === 'active' ? 'Ativo' : member.status === 'pending' ? 'Pendente' : 'Inativo'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-slate-400 hover:text-[#13ec5b] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar Perfil">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Histórico">
                                                        <span className="material-symbols-outlined text-[20px]">history</span>
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Remover">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AddPlayerModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => fetchMembers()} // Refresh list
                    groupId={groupId}
                />
            </div>
        </div>
    );
}


