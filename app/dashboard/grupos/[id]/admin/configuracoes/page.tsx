"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../../src/lib/client";
import ConfirmationModal from "../../../../../../app/components/ConfirmationModal";

interface Admin {
    id: string; // group_member id
    user_id: string;
    role: string;
    profile: {
        full_name: string;
        avatar_url: string;
    } | null;
}

interface Member {
    id: string; // group_member id
    user_id: string;
    profile: {
        full_name: string;
        avatar_url: string;
    } | null;
}

export default function GroupSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    // Core Data
    const [groupName, setGroupName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Rules Data
    const [duration, setDuration] = useState(60);
    const [maxPlayers, setMaxPlayers] = useState(14);
    const [tolerance, setTolerance] = useState(15);

    // Finance Data
    const [priceMensalista, setPriceMensalista] = useState(0);
    const [priceAvulso, setPriceAvulso] = useState(0);

    // Privacy Data
    const [isPrivate, setIsPrivate] = useState(false);
    const [manualApproval, setManualApproval] = useState(false);

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [members, setMembers] = useState<Member[]>([]); // For promoting to admin

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (groupId) fetchData();
    }, [groupId]);

    async function fetchData() {
        try {
            // 1. Fetch Group Details
            const { data: groupData, error: groupError } = await supabase
                .from("groups")
                .select("name, location, description, max_members, visibility, image_url, manual_approval, price_mensalista, price_avulso")
                .eq("id", groupId)
                .single();

            if (groupError) throw groupError;

            if (groupData) {
                setGroupName(groupData.name || "");
                setLocation(groupData.location || "");
                setDescription(groupData.description || "");
                setImageUrl(groupData.image_url || "");

                if (groupData.max_members) setMaxPlayers(groupData.max_members);
                setIsPrivate(groupData.visibility === 'private');
                setManualApproval(groupData.manual_approval || false);
                setPriceMensalista(groupData.price_mensalista || 0);
                setPriceAvulso(groupData.price_avulso || 0);
            }

            // 2. Fetch All Members (to separate admins and potential admins)
            const { data: membersData, error: membersError } = await supabase
                .from("group_members")
                .select("id, user_id, role")
                .eq("group_id", groupId);

            if (membersError) throw membersError;

            if (membersData && membersData.length > 0) {
                const userIds = membersData.map((m: any) => m.user_id);
                const { data: profilesData, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .in("id", userIds);

                if (profilesError) throw profilesError;

                const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]));

                const adminsList: Admin[] = [];
                const regularMembers: Member[] = [];

                membersData.forEach((m: any) => {
                    const profile = profilesMap.get(m.user_id) || null;
                    if (m.role === 'admin' || m.role === 'owner') {
                        adminsList.push({ ...m, profile });
                    } else {
                        regularMembers.push({ ...m, profile });
                    }
                });

                setAdmins(adminsList);
                setMembers(regularMembers); // Candidates for admin
            } else {
                setAdmins([]);
                setMembers([]);
            }

        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ type: 'error', text: "Erro ao carregar dados." });
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${groupId}/${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('group-logos')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('group-logos')
                .getPublicUrl(fileName);

            // Update immediately - nice UX
            const { error: updateError } = await supabase
                .from('groups')
                .update({ image_url: publicUrl })
                .eq('id', groupId);

            if (updateError) throw updateError;

            setImageUrl(publicUrl);
            setMessage({ type: 'success', text: "Logo atualizado com sucesso!" });
            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            console.error("Error uploading logo:", error);
            setMessage({ type: 'error', text: "Erro ao fazer upload da imagem." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from("groups")
                .update({
                    name: groupName,
                    location: location,
                    description: description,
                    max_members: maxPlayers,
                    visibility: isPrivate ? 'private' : 'public',
                    manual_approval: manualApproval,
                    price_mensalista: priceMensalista,
                    price_avulso: priceAvulso
                })
                .eq("id", groupId);

            if (error) throw error;

            setMessage({ type: 'success', text: "Configurações salvas!" });
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error("Error updating group:", error);
            setMessage({ type: 'error', text: "Erro ao salvar alterações." });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePromoteAdmin = async (memberId: string) => {
        try {
            const { error } = await supabase
                .from("group_members")
                .update({ role: "admin" })
                .eq("id", memberId);

            if (error) throw error;

            setMessage({ type: 'success', text: "Membro promovido a Admin!" });
            setShowAddAdminModal(false);
            fetchData(); // Refresh lists
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error promoting member:", error);
            setMessage({ type: 'error', text: "Erro ao promover membro." });
        }
    };

    // Function to remove admin (demote to member)
    const handleRemoveAdmin = async (memberId: string) => {
        if (!confirm("Tem certeza que deseja remover este admin?")) return;

        try {
            const { error } = await supabase
                .from("group_members")
                .update({ role: "member" })
                .eq("id", memberId);

            if (error) throw error;

            setMessage({ type: 'success', text: "Admin removido com sucesso." });
            fetchData();
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error removing admin:", error);
            setMessage({ type: 'error', text: "Erro ao remover admin." });
        }
    }

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteGroup = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteGroup = async () => {
        setIsDeleting(true);
        try {
            // RELY ON DATABASE CASCADING
            // matches, transactions, and group_members are all set to ON DELETE CASCADE
            // So we just need to delete the group, and everything else goes with it.
            // IMPORTANT: We MUST NOT delete group_members manually first, otherwise we lose the "Admin" permission 
            // required to delete the group itself (since RLS checks if we are an admin).

            const { error, count } = await supabase
                .from("groups")
                .delete({ count: 'exact' })
                .eq("id", groupId);

            if (error) throw error;

            if (count === 0) {
                console.warn("Delete command completed but 0 rows affected. RLS might be blocking it.");
                throw new Error("Permissão negada ou grupo não encontrado. Verifique se você é o dono do grupo.");
            }

            alert("Grupo e todos os dados excluídos com sucesso.");

            // Force hard reload to ensure cache is cleared and "My Groups" is updated
            window.location.href = "/dashboard";

        } catch (error: any) {
            console.error("Error deleting group:", error);
            // Alert full error details for debugging
            alert("Erro ao excluir grupo: " + (error.message || JSON.stringify(error)));
            setMessage({ type: 'error', text: "Erro ao excluir grupo: " + (error.message || "Erro desconhecido") });
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };


    if (isLoading) {
        return (
            <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-center">
                <p className="text-slate-500">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 pb-12 flex flex-col gap-8 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl md:text-3xl font-black tracking-tight text-[#0d1b12] dark:text-white">Configurações do Grupo</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Gerencie informações, regras e permissões.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-center font-bold sticky top-4 z-50 shadow-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Principal - Esquerda (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Dados do Grupo */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">badge</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Dados do Grupo</h3>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`relative w-24 h-24 rounded-2xl bg-gray-100 dark:bg-[#25382e] border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#13ec5b] transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
                                        )}
                                        <input
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <button type="button" className="text-xs font-bold text-[#13ec5b] hover:text-[#0fd652]">
                                        {isUploading ? 'Enviando...' : 'Alterar Logo'}
                                    </button>
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome do Grupo</label>
                                            <input
                                                className="w-full rounded-xl border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 px-4 py-3 text-[#0d1b12] dark:text-white focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                                type="text"
                                                value={groupName}
                                                onChange={(e) => setGroupName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Local Padrão</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400 text-[20px]">location_on</span>
                                                <input
                                                    className="w-full rounded-xl border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 pl-10 pr-4 py-3 text-[#0d1b12] dark:text-white focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                                        <textarea
                                            className="w-full rounded-xl border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 px-4 py-3 text-[#0d1b12] dark:text-white focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                                            rows={2}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={(e) => handleSave(e)}
                                            disabled={isSaving}
                                            className="bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#13ec5b]/20 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                                    Salvando...
                                                </>
                                            ) : (
                                                "Salvar Dados"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Administradores */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Administradores</h3>
                            </div>
                            <button
                                onClick={() => setShowAddAdminModal(true)}
                                className="text-[#13ec5b] hover:text-[#0fd652] font-bold text-sm flex items-center gap-1 bg-[#13ec5b]/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span> Novo Admin
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {admins.map((admin) => (
                                <div key={admin.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-[#e7f3eb] dark:border-[#2a4032]">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {admin.profile?.avatar_url ? (
                                            <img src={admin.profile.avatar_url} alt={admin.profile.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                {admin.profile?.full_name?.charAt(0).toUpperCase() || "A"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#0d1b12] dark:text-white truncate">{admin.profile?.full_name || "Usuário não encontrado"}</p>
                                        <p className="text-xs text-[#13ec5b] font-bold uppercase">{admin.role === 'owner' ? 'Dono do Grupo' : 'Administrador'}</p>
                                    </div>
                                    {admin.role !== 'owner' && (
                                        <button
                                            onClick={() => handleRemoveAdmin(admin.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Remover Admin"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Coluna Lateral - Direita (1/3) */}
                <div className="flex flex-col gap-6">
                    {/* Regras */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Regras do Jogo</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Duração & Jogadores */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Duração</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] rounded-lg p-2 text-center font-bold text-[#0d1b12] dark:text-white"
                                        />
                                        <span className="text-sm font-medium text-gray-400">min</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Jogadores</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={maxPlayers}
                                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] rounded-lg p-2 text-center font-bold text-[#0d1b12] dark:text-white"
                                        />
                                        <span className="text-sm font-medium text-gray-400">pax</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tolerância */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Tolerância</label>
                                    <span className="text-xs font-bold text-[#0d1b12] dark:text-white">{tolerance} min</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    step="5"
                                    value={tolerance}
                                    onChange={(e) => setTolerance(Number(e.target.value))}
                                    className="w-full accent-[#13ec5b]"
                                />
                                <p className="text-xs text-gray-400 mt-2 leading-tight">
                                    Tempo de espera permitido para confirmação de presença antes de liberar a vaga.
                                </p>
                            </div>

                            {/* Preços */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço Mensalista</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-400">R$</span>
                                        <input
                                            type="number"
                                            value={priceMensalista}
                                            onChange={(e) => setPriceMensalista(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] rounded-lg p-2 text-center font-bold text-[#0d1b12] dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço Avulso</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-400">R$</span>
                                        <input
                                            type="number"
                                            value={priceAvulso}
                                            onChange={(e) => setPriceAvulso(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] rounded-lg p-2 text-center font-bold text-[#0d1b12] dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleSave(e)}
                                className="w-full bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold py-3 rounded-xl transition-colors shadow-lg shadow-[#13ec5b]/20"
                            >
                                Salvar Regras
                            </button>
                        </div>
                    </div>

                    {/* Privacidade */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Privacidade</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Toggle Private */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#0d1b12] dark:text-white">Grupo Privado</span>
                                    <span className="text-xs text-gray-500">Apenas convidados.</span>
                                </div>
                                <button
                                    onClick={() => setIsPrivate(!isPrivate)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${isPrivate ? 'bg-[#13ec5b]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isPrivate ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Toggle Approval */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#0d1b12] dark:text-white">Aprovação Manual</span>
                                    <span className="text-xs text-gray-500">Admin aprova membros.</span>
                                </div>
                                <button
                                    onClick={() => setManualApproval(!manualApproval)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${manualApproval ? 'bg-[#13ec5b]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${manualApproval ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <button
                                onClick={(e) => handleSave(e)}
                                className="w-full bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold py-3 rounded-xl transition-colors shadow-lg shadow-[#13ec5b]/20"
                            >
                                Salvar Privacidade
                            </button>
                        </div>
                    </div>

                    {/* Zona de Perigo */}
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200 dark:border-red-900/50">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Zona de Perigo</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-red-600/80 dark:text-red-400/80">
                                A exclusão do grupo é irreversível. Todas as partidas, pagamentos e histórico serão perdidos permanentemente.
                            </p>

                            <button
                                onClick={handleDeleteGroup}
                                disabled={isSaving}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">delete_forever</span>
                                Excluir Grupo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Novo Admin */}
            {showAddAdminModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a2c20] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="p-4 border-b border-[#e7f3eb] dark:border-[#2a4032] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white">Adicionar Administrador</h3>
                            <button onClick={() => setShowAddAdminModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {members.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    Todos os membros já são administradores ou não há outros membros no grupo.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {members.map(member => (
                                        <li key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#102216]/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    {member.profile?.avatar_url ? (
                                                        <img src={member.profile.avatar_url} alt={member.profile.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                            {member.profile?.full_name?.charAt(0).toUpperCase() || "M"}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[#0d1b12] dark:text-white text-sm">{member.profile?.full_name}</span>
                                            </div>
                                            <button
                                                onClick={() => handlePromoteAdmin(member.id)}
                                                className="bg-[#13ec5b]/10 hover:bg-[#13ec5b]/20 text-[#13ec5b] font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Promover
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteGroup}
                title="Excluir Grupo"
                message={`Tem certeza que deseja excluir o grupo "${groupName}"? Todas as partidas, jogadores e histórico serão apagados permanentemente.`}
                confirmText="Excluir Grupo"
                type="danger"
                isLoading={isDeleting}
                verificationText={groupName}
            />
        </div>
    );
}
