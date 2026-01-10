"use client";

import { use, useState, useEffect } from "react";
import { supabase } from "../../../../../../src/lib/client";

interface Member {
    id: string; // group_member id
    user_id: string;
    role: string;
    status: string; // 'active', 'pending', 'banned'
    payment_type: 'MENSALISTA' | 'AVULSO' | 'CONVIDADO';
    monthly_price_override: number | null;
    joined_at: string;
    profiles: {
        full_name: string;
        position: string;
        skill_level: string;
        avatar_url: string;
        email?: string; // Sometimes email is in auth, but maybe stored in profile or just placeholder
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

    const handleInvite = () => {
        const link = `${window.location.origin}/dashboard/grupos/${groupId}`;
        navigator.clipboard.writeText(link).then(() => {
            alert("Link de convite copiado para a área de transferência!");
        }).catch(err => {
            console.error("Failed to copy: ", err);
            // Fallback for http
            const textArea = document.createElement("textarea");
            textArea.value = link;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert("Link de convite copiado para a área de transferência!");
            } catch (e) {
                alert("Não foi possível copiar o link. Copie manualmente: " + link);
            }
            document.body.removeChild(textArea);
        });
    };

    useEffect(() => {
        async function fetchMembers() {
            try {
                // 1. Fetch Members
                const { data: membersData, error: membersError } = await supabase
                    .from("group_members")
                    .select('*')
                    .eq("group_id", groupId);

                if (membersError) throw membersError;

                if (!membersData || membersData.length === 0) {
                    setMembers([]);
                    return;
                }

                // 2. Fetch Profiles for these members
                const userIds = membersData.map((m: any) => m.user_id);
                const { data: profilesData, error: profilesError } = await supabase
                    .from("profiles")
                    .select('id, full_name, position, skill_level, avatar_url') // Removed email as it doesn't exist
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                // 3. Merge Data
                const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]));

                const mergedMembers = membersData.map((member: any) => ({
                    ...member,
                    profiles: profilesMap.get(member.user_id) || null
                }));

                setMembers(mergedMembers);

            } catch (error: any) {
                console.error("Error fetching members:", error);
                const message = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
                setErrorMsg(message);
            } finally {
                setIsLoading(false);
            }
        }

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
        } catch (error) {
            console.error("Error updating payment type:", error);
            alert("Erro ao atualizar tipo de pagamento.");
        }
    };

    // Stats
    const totalPlayers = members.length;
    const mensalistas = members.filter(m => m.payment_type === 'MENSALISTA').length;
    const avulsos = members.filter(m => m.payment_type === 'AVULSO').length;
    const convidados = members.filter(m => m.payment_type === 'CONVIDADO').length;
    const inativos = members.filter(m => m.status === 'banned' || m.status === 'inactive').length;

    // Filtering
    const filteredMembers = members.filter(member => {
        const name = member.profiles?.full_name?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        const matchesSearch = name.includes(search);

        const matchesType = typeFilter === "Todos os tipos"
            ? true
            : typeFilter === "Mensalistas"
                ? member.payment_type === 'MENSALISTA'
                : typeFilter === "Avulsos"
                    ? member.payment_type === 'AVULSO'
                    : member.payment_type === 'CONVIDADO';

        const matchesStatus = statusFilter === "Status: Todos"
            ? true
            : statusFilter === "Ativo"
                ? member.status === 'active'
                : statusFilter === "Pendente"
                    ? member.status === 'pending'
                    : member.status === 'banned'; // or logic for 'Lesionado' if we had it

        return matchesSearch && matchesType && matchesStatus;
    });

    // Helper: Stars from Skill Level
    const renderStars = (skill: string) => {
        // Simple mapping based on text. Adjust as needed if values are different.
        // Assuming values like 'Iniciante', 'Intermediário', 'Avançado', 'Craque'.
        let level = 3;
        if (skill?.toLowerCase().includes('iniciante')) level = 1;
        if (skill?.toLowerCase().includes('intermediário') || skill?.toLowerCase().includes('medio')) level = 3;
        if (skill?.toLowerCase().includes('avançado')) level = 4;
        if (skill?.toLowerCase().includes('profissional') || skill?.toLowerCase().includes('craque')) level = 5;

        return (
            <div className="flex text-amber-400 text-[18px]">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined icon-filled ${i < level ? "" : "text-slate-300 dark:text-slate-600"}`}>
                        star
                    </span>
                ))}
            </div>
        );
    };

    // Helper: Initials
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
                        onClick={handleInvite}
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
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avulsos</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{avulsos}</p>
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
                            <option>Avulsos</option>
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
                                            <span className="text-xs text-red-400 opacity-70">
                                                Debug Info: Total fetched: {members.length}, Filtered: {filteredMembers.length} {errorMsg ? `| Error: ${errorMsg}` : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map(member => (
                                        <tr key={member.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                        {member.profiles?.avatar_url ? (
                                                            <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                                                                {getInitials(member.profiles?.full_name || "Desconhecido")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{member.profiles?.full_name || "Usuário não encontrado"}</p>
                                                        {/* Email might not be available in simple join if profiles doesn't have it, but for UI we assume it might */}
                                                        {/* <p className="text-xs text-slate-500">email@placeholder.com</p> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={member.payment_type}
                                                    onChange={(e) => handleUpdatePaymentType(member.id, e.target.value)}
                                                    className={`text-xs font-bold border rounded-full px-2 py-0.5 outline-none cursor-pointer transition-colors ${member.payment_type === 'MENSALISTA'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                        : member.payment_type === 'AVULSO'
                                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                                                        }`}
                                                >
                                                    <option value="AVULSO">Avulso</option>
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
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Mostrando {filteredMembers.length} de {totalPlayers} jogadores</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors" disabled>Anterior</button>
                            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Próximo</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
