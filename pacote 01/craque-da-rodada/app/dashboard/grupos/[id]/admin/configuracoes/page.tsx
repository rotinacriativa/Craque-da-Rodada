"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function GroupSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");
    const [privacy, setPrivacy] = useState("private"); // public | private

    useEffect(() => {
        async function fetchGroup() {
            try {
                const { data, error } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();

                if (data) {
                    setName(data.name || "");
                    setDescription(data.description || "");
                    // Assuming 'rules' and 'privacy' columns might exist or will be added. 
                    // For now, mapping to existing or placeholder state.
                    // If columns don't exist yet in DB, these might just hold local state for now.
                    // setRules(data.rules || ""); 
                    // setPrivacy(data.privacy || "private");
                }
            } catch (error) {
                console.error("Error fetching group settings:", error);
            } finally {
                setLoading(false);
            }
        }
        if (groupId) fetchGroup();
    }, [groupId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('groups')
                .update({
                    name,
                    description,
                    // rules: rules, 
                    // privacy: privacy
                })
                .eq('id', groupId);

            if (error) throw error;

            // Show success feedback (could use a toast library here)
            alert("Configurações salvas com sucesso!");
            router.refresh();
        } catch (error) {
            console.error("Error updating group:", error);
            alert("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-full pb-20 relative">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex mb-6">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <Link className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#13ec5b] dark:text-gray-400 dark:hover:text-white transition-colors" href="/dashboard">
                            <span className="material-symbols-outlined mr-2 text-[20px]">home</span>
                            Home
                        </Link>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                            <Link className="ml-1 text-sm font-medium text-gray-500 hover:text-[#13ec5b] md:ml-2 dark:text-gray-400 dark:hover:text-white transition-colors" href={`/dashboard/grupos/${groupId}`}>
                                Meus Grupos
                            </Link>
                        </div>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                            <Link className="ml-1 text-sm font-medium text-gray-500 hover:text-[#13ec5b] md:ml-2 dark:text-gray-400 dark:hover:text-white transition-colors" href={`/dashboard/grupos/${groupId}/admin`}>
                                Admin
                            </Link>
                        </div>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                            <span className="ml-1 text-sm font-medium text-[#0d1b12] md:ml-2 dark:text-white">Configurações</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1b12] dark:text-white mb-2">
                        Configurações do Grupo
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-light max-w-2xl">
                        Gerencie as informações principais, regras e privacidade da sua pelada.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
                {/* Identity Card */}
                <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-3 flex-shrink-0">
                            <div className="relative group cursor-pointer">
                                <div className="size-32 rounded-full bg-cover bg-center border-4 border-[#f0fdf4] dark:border-[#13ec5b]/10 shadow-inner bg-gray-100" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJwN-cOTkiGzovotXrGX2yGTY2Dih4dLtBkx2JEzL8dyG1IkALXWQhHE-81JI89mvuw8bvn7PBzkMzj-Kcir0rQzGGiPWIX2t63Of_Xwe-33l-wfh3ghjB7GLYSGEXjF_iPICtaGurCZcps39qXMo9KwdpFFE_TXahf4n2yE3yBbA-Uyuet7U1PidQzKy5JDLZB-nOpwSDu7WiDOS97DLkYgGooG6ID30KY6kNUZ05h_jjGNDfVLz4ztGPVyv2W3DJ9k4svy1RPQk')" }}>
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white">edit</span>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-[#13ec5b] text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-[#1a3322] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Recomendado 500x500px</p>
                        </div>
                        {/* Basic Info Fields */}
                        <div className="flex-1 w-full grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1" htmlFor="groupName">Nome do Grupo</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400">groups</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="groupName"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#f6f8f6] dark:bg-[#102216] border border-transparent focus:border-[#13ec5b] focus:ring-0 rounded-2xl text-[#0d1b12] dark:text-white placeholder-gray-400 transition-all font-medium"
                                        placeholder="Ex: Pelada dos Amigos"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-1" htmlFor="description">Descrição Curta</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full p-4 bg-[#f6f8f6] dark:bg-[#102216] border border-transparent focus:border-[#13ec5b] focus:ring-0 rounded-2xl text-[#0d1b12] dark:text-white placeholder-gray-400 transition-all resize-none"
                                    placeholder="Uma breve descrição sobre o grupo..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rules Card */}
                <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 flex items-center justify-center">
                            <span className="material-symbols-outlined">gavel</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Regras e Conduta</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Defina as regras para pagamento, horários e comportamento.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <textarea
                            id="rules"
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            rows={8}
                            className="w-full p-5 bg-[#f6f8f6] dark:bg-[#102216] border border-transparent focus:border-[#13ec5b] focus:ring-0 rounded-2xl text-[#0d1b12] dark:text-white placeholder-gray-400 transition-all"
                            placeholder="1. Pagamento até 24h antes do jogo..."
                        ></textarea>
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white dark:bg-[#1a2c20] px-2 py-1 rounded-lg opacity-80">Markdown suportado</div>
                    </div>
                </div>

                {/* Privacy Card */}
                <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Privacidade</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Controle quem pode ver e entrar no seu grupo.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Public Option */}
                        <label className={`relative flex flex-col p-5 bg-[#f6f8f6] dark:bg-[#102216] rounded-2xl border-2 cursor-pointer transition-all group ${privacy === 'public' ? 'border-[#13ec5b] bg-[#13ec5b]/5' : 'border-transparent hover:border-[#13ec5b]/50'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="bg-white dark:bg-[#1a3322] p-2 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">public</span>
                                </div>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="public"
                                    checked={privacy === 'public'}
                                    onChange={() => setPrivacy('public')}
                                    className="size-5 text-[#13ec5b] border-gray-300 focus:ring-[#13ec5b] bg-gray-100 dark:bg-gray-700"
                                />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white mb-1">Grupo Público</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Qualquer pessoa pode encontrar o grupo na busca e solicitar participação.</span>
                        </label>
                        {/* Private Option */}
                        <label className={`relative flex flex-col p-5 bg-[#f6f8f6] dark:bg-[#102216] rounded-2xl border-2 cursor-pointer transition-all group ${privacy === 'private' ? 'border-[#13ec5b] bg-[#13ec5b]/5' : 'border-transparent hover:border-[#13ec5b]/50'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="bg-white dark:bg-[#1a3322] p-2 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">verified_user</span>
                                </div>
                                <input
                                    type="radio"
                                    name="privacy"
                                    value="private"
                                    checked={privacy === 'private'}
                                    onChange={() => setPrivacy('private')}
                                    className="size-5 text-[#13ec5b] border-gray-300 focus:ring-[#13ec5b] bg-gray-100 dark:bg-gray-700"
                                />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white mb-1">Grupo Privado</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">O grupo fica oculto. Novos membros entram apenas através de convite direto.</span>
                        </label>
                    </div>
                </div>

                {/* Sticky Footer Action Bar */}
                <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-4 bg-white/80 dark:bg-[#102216]/80 backdrop-blur-md border-t border-[#e7f3eb] dark:border-[#2a4032] flex items-center justify-end gap-3 z-10 transition-all duration-300">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 rounded-full text-sm font-bold bg-[#13ec5b] text-[#0d1b12] hover:bg-[#0fd650] hover:shadow-lg hover:shadow-[#13ec5b]/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="size-5 block rounded-full border-2 border-[#0d1b12] border-r-transparent animate-spin"></span>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">check</span>
                        )}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>

            <div className="h-20"></div> {/* Spacer for sticky footer */}
        </div>
    );
}
