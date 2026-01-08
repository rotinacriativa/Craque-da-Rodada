"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabaseClient";

interface Member {
    id: string; // group_members.id
    user_id: string;
    role: 'admin' | 'member';
    status: 'active' | 'pending' | 'banned';
    joined_at: string;
    profile: {
        full_name: string;
        avatar_url: string;
        position: string;
    }
}

export default function GroupMembersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    const [activeMembers, setActiveMembers] = useState<Member[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Member[]>([]);
    const [bannedMembers, setBannedMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'active' | 'requests' | 'banned'>('active');
    const [searchTerm, setSearchTerm] = useState("");

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('group_members')
                .select(`
                    id,
                    user_id,
                    role,
                    status,
                    joined_at,
                    profile:profiles (
                        full_name,
                        avatar_url,
                        position
                    )
                `)
                .eq('group_id', groupId);

            if (error) {
                console.error("Error fetching members:", error);
                return;
            }

            // Transform data to match interface if needed (Supabase returns array of objects)
            // Ideally, we trust the shape, but let's be safe with 'any' cast during dev if Typescript complains about deep join types not being auto-generated yet.
            const members = (data as any[]).map(item => ({
                id: item.id,
                user_id: item.user_id,
                role: item.role,
                status: item.status,
                joined_at: item.joined_at,
                profile: item.profile || { full_name: 'Usuário Desconhecido', avatar_url: null, position: '-' }
            }));

            setActiveMembers(members.filter(m => m.status === 'active'));
            setPendingRequests(members.filter(m => m.status === 'pending'));
            setBannedMembers(members.filter(m => m.status === 'banned'));

        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchMembers();
        }
    }, [groupId]);

    const handleAction = async (memberId: string, action: 'approve' | 'reject' | 'ban' | 'promote') => {
        if (!confirm("Tem certeza que deseja realizar esta ação?")) return;
        setActionLoading(memberId);

        try {
            let update = {};
            if (action === 'approve') update = { status: 'active' };
            if (action === 'reject') update = { status: 'rejected' }; // Or delete row
            if (action === 'ban') update = { status: 'banned' };
            if (action === 'promote') update = { role: 'admin' };

            // For reject, maybe we want to delete to allow re-request? Or keep history?
            // Let's assume 'delete' for reject to keep it simple for now, or status 'rejected' if we want history.
            // Design says "Recusar", usually requests vanish.

            let error;
            if (action === 'reject') {
                const { error: deleteError } = await supabase.from('group_members').delete().eq('id', memberId);
                error = deleteError;
            } else {
                const { error: updateError } = await supabase.from('group_members').update(update).eq('id', memberId);
                error = updateError;
            }

            if (error) throw error;

            // Refresh list
            await fetchMembers();
            alert("Ação realizada com sucesso!");

        } catch (err) {
            console.error("Error performing action:", err);
            alert("Erro ao realizar ação.");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredActive = activeMembers.filter(m =>
        m.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 bg-[#f6f8f6] dark:bg-[#102216]">
            {/* Header - Simplified for brevity (reuse existing layout structure) */}
            <div className="w-full px-6 py-5 md:px-10 md:py-8">
                <div className="max-w-6xl mx-auto w-full">
                    <nav className="flex flex-wrap items-center gap-2 text-sm md:text-base mb-8">
                        {/* Breadcrumbs */}
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href="/dashboard">Dashboard</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href={`/dashboard/grupos/${groupId}`}>Meu Grupo</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href={`/dashboard/grupos/${groupId}/admin`}>Admin</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium bg-white dark:bg-[#1a2c22] px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">Membros</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gerenciar Membros</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">Administre quem entra e quem joga no seu grupo.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-[#13ec5b] hover:bg-[#0fd652] text-slate-900 px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#13ec5b]/20">
                            <span className="material-symbols-outlined">person_add</span>
                            Convidar Jogadores
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 pb-12 md:px-10">
                <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#1a2c22] p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Jogadores Ativos
                            <span className="bg-[#0d1b12]/10 dark:bg-white/10 px-2 py-0.5 rounded text-xs ml-1">{activeMembers.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Solicitações
                            {pendingRequests.length > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs ml-1 animate-pulse">{pendingRequests.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('banned')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'banned' ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Banidos
                            <span className="bg-[#0d1b12]/10 dark:bg-white/10 px-2 py-0.5 rounded text-xs ml-1">{bannedMembers.length}</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    {activeTab === 'active' && (
                        <div className="flex flex-col gap-4">
                            {/* Search */}
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar jogador por nome..."
                                    className="w-full h-12 pl-12 pr-4 bg-white dark:bg-[#1a2c22] rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-[#13ec5b]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* List */}
                            <div className="bg-white dark:bg-[#1a2c22] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-500">Carregando membros...</div>
                                ) : filteredActive.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl text-slate-400">groups_2</span>
                                        </div>
                                        <p className="text-slate-900 dark:text-white font-bold">Nenhum jogador encontrado</p>
                                        <p className="text-slate-500 text-sm">Convide a galera para começar a jogar!</p>
                                    </div>
                                ) : (
                                    filteredActive.map((member) => (
                                        <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url('${member.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{member.profile.full_name}</h4>
                                                    {member.role === 'admin' && <span className="bg-[#13ec5b]/20 text-[#0d1b12] dark:text-[#13ec5b] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>}
                                                </div>
                                                <p className="text-slate-500 text-sm">{member.profile.position || "Sem posição definida"}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Actions */}
                                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors" title="Ver Perfil">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAction(member.id, 'ban')}
                                                    disabled={actionLoading === member.id}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors" title="Banir Jogador"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">block</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="flex flex-col gap-4">
                            {pendingRequests.length === 0 ? (
                                <div className="p-12 text-center bg-white dark:bg-[#1a2c22] rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500">Nenhuma solicitação pendente no momento.</p>
                                </div>
                            ) : (
                                pendingRequests.map((req) => (
                                    <div key={req.id} className="bg-white dark:bg-[#1a2c22] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${req.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{req.profile.full_name}</h4>
                                            <p className="text-slate-500 text-sm">Quer entrar no grupo • {new Date(req.joined_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => handleAction(req.id, 'reject')}
                                                disabled={actionLoading === req.id}
                                                className="flex-1 md:flex-none py-2.5 px-5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                Recusar
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'approve')}
                                                disabled={actionLoading === req.id}
                                                className="flex-1 md:flex-none py-2.5 px-5 rounded-lg bg-[#13ec5b] hover:bg-[#0fd652] font-bold text-slate-900 transition-colors shadow-lg shadow-[#13ec5b]/20"
                                            >
                                                Aprovar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Banned logic similar to active/requests but simplified, usually just 'Unban' */}
                </div>
            </div>
        </div>
    );
}
