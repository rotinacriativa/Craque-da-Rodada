import { useState, useEffect } from "react";
import { supabase } from "../../src/lib/client";

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: string;
    groupId: string;
    existingPlayerIds: string[];
    onAdd: () => void;
}

interface Member {
    user_id: string;
    role: string;
    profile: {
        full_name: string;
        avatar_url: string | null;
        position: string | null;
    }
}

export default function AddPlayerModal({ isOpen, onClose, matchId, groupId, existingPlayerIds, onAdd }: AddPlayerModalProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Get all group members
            const { data: memberData, error } = await supabase
                .from('group_members')
                .select(`
                    user_id,
                    role,
                    profile:profiles!inner(full_name, avatar_url, position)
                `)
                .eq('group_id', groupId);

            if (error) throw error;

            // Filter out existing players
            const availableMembers = (memberData as any[])
                .filter(m => !existingPlayerIds.includes(m.user_id))
                .sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name));

            setMembers(availableMembers);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (userId: string) => {
        setAddingId(userId);
        try {
            const { error } = await supabase
                .from('match_participants')
                .insert({
                    match_id: matchId,
                    user_id: userId,
                    status: 'confirmed'
                });

            if (error) throw error;

            onAdd(); // Refresh data
            // Remove from local list
            setMembers(prev => prev.filter(m => m.user_id !== userId));
        } catch (error) {
            console.error("Error adding player:", error);
            alert("Erro ao adicionar jogador.");
        } finally {
            setAddingId(null);
        }
    };

    if (!isOpen) return null;

    const filteredMembers = members.filter(m =>
        m.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a2e22] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h3 className="text-xl font-black text-[#0d1b12] dark:text-white">Adicionar Jogador</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Selecione membros do grupo</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-10 bg-gray-100 dark:bg-black/20 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#13ec5b] transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <span className="size-6 border-2 border-[#13ec5b] border-r-transparent rounded-full animate-spin"></span>
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 text-sm">
                            {searchTerm ? "Nenhum membro encontrado." : "Todos os membros já estão na partida."}
                        </div>
                    ) : (
                        filteredMembers.map(member => (
                            <button
                                key={member.user_id}
                                onClick={() => handleAdd(member.user_id)}
                                disabled={addingId === member.user_id}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                            >
                                <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${member.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#0d1b12] dark:text-white truncate">{member.profile.full_name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{member.profile.position || 'Jogador'}</p>
                                </div>
                                {addingId === member.user_id ? (
                                    <span className="size-4 border-2 border-[#13ec5b] border-r-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <span className="size-8 rounded-full bg-[#13ec5b]/10 text-[#13ec5b] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
