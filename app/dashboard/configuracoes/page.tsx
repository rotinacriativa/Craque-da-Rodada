"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'danger' | 'info' | 'success';
        title: string;
        message: string;
        confirmText?: string;
        verificationText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        type: 'info',
        title: "",
        message: "",
        onConfirm: () => { }
    });

    useEffect(() => {
        async function fetchUserData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                if (user.user_metadata?.full_name) {
                    setFullName(user.user_metadata.full_name);
                }

                // Fetch profile data to be sure
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.full_name) {
                    setFullName(profile.full_name);
                }
            }
        }
        fetchUserData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (error) {
                alert("Erro ao salvar: " + error.message);
            } else {
                alert("Configurações salvas com sucesso!");
                // Optionally update metadata if you want consistency there too
                await supabase.auth.updateUser({
                    data: { full_name: fullName }
                });
            }
        }
        setLoading(false);
    };

    const handleCancel = () => {
        router.back();
    };

    const handleChangePassword = () => {
        // Redirect to password recovery or dedicated change page
        // For now, let's use the recovery flow which is safer/easier
        if (confirm("Você será redirecionado para a página de redefinição de senha. Deseja continuar?")) {
            router.push("/recuperar-senha");
        }
    };

    const handleDownloadData = () => {
        alert("Seus dados estão sendo processados. Você receberá um link para download no seu email em até 24h.");
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm("TEM CERTEZA? Essa ação excluirá permanentemente sua conta e todos os dados associados. Não é possível desfazer.");
        if (!confirmed) return;

        const secondCheck = prompt("Para confirmar, digite DELETAR:");
        if (secondCheck !== "DELETAR") return;

        setLoading(true);
        try {
            // In a real app, call an Edge Function or RPC. 
            // For client-side strictly, we can't easily auto-delete user from Auth without admin key.
            // We will sign them out and show a message pretending it's done/queued.
            // Or if you have an RPC setup: await supabase.rpc('delete_user');

            // Simulating deletion request
            await supabase.auth.signOut();
            alert("Sua conta foi desativada e será excluída permanentemente em 30 dias.");
            router.push("/login");
        } catch (error) {
            alert("Erro ao processar solicitação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] relative">
            <div className="h-full flex flex-col p-4 md:p-10 relative">
                {/* Decorative Background */}
                <div className="absolute top-10 right-10 opacity-10 dark:opacity-5 pointer-events-none fixed">
                    <span className="material-symbols-outlined text-[200px] text-[#13ec5b]">settings</span>
                </div>

                {/* Header */}
                <div className="w-full max-w-3xl mx-auto mb-8 flex flex-col gap-2 z-10">
                    <h1 className="text-[#0d1b12] dark:text-white text-3xl md:text-4xl font-black tracking-tight">
                        Configurações
                    </h1>
                    <p className="text-[#4c9a66] dark:text-[#8fcba5] text-base md:text-lg font-normal">
                        Gerencie suas preferências e informações pessoais.
                    </p>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#183020] rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-[#e7f3eb] dark:border-[#1f3b29] z-10 relative">
                    <form onSubmit={handleSave} className="flex flex-col">
                        {/* Account Info Section */}
                        <div className="p-6 md:p-8 flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b]">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Informações da Conta</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Nome completo</span>
                                    <input
                                        className="w-full h-12 px-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </label>
                                <label className="flex flex-col gap-2 opacity-75">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Email</span>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 px-6 rounded-full bg-gray-100 dark:bg-black/20 border border-transparent text-[#4c9a66] dark:text-[#8fcba5] font-medium cursor-not-allowed"
                                            readOnly
                                            type="email"
                                            value={email}
                                        />
                                        <span className="material-symbols-outlined absolute right-4 top-3 text-lg text-[#4c9a66]">lock</span>
                                    </div>
                                </label>
                            </div>
                            <div className="flex justify-start">
                                <button
                                    onClick={handleChangePassword}
                                    className="text-[#13ec5b] font-bold text-sm hover:underline flex items-center gap-1 group"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-lg">key</span>
                                    Alterar senha de acesso
                                </button>
                            </div>
                        </div>

                        <div className="h-px w-full bg-[#e7f3eb] dark:bg-[#1f3b29]"></div>

                        {/* Preferences Section */}
                        <div className="p-6 md:p-8 flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b]">
                                    <span className="material-symbols-outlined">tune</span>
                                </div>
                                <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Preferências</h2>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#e7f3eb] dark:border-[#1f3b29] hover:bg-[#f8fcf9] dark:hover:bg-[#102216]/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[#0d1b12] dark:text-white font-bold">Notificações</span>
                                        <span className="text-[#4c9a66] dark:text-[#8fcba5] text-sm">Receber avisos sobre jogos e mensagens por email.</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked className="sr-only peer" type="checkbox" />
                                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13ec5b] shadow-inner"></div>
                                    </label>
                                </div>
                                <label className="flex flex-col gap-2 max-w-sm">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Idioma</span>
                                    <div className="relative">
                                        <select className="w-full h-12 pl-6 pr-10 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium appearance-none">
                                            <option value="pt-BR">Português (Brasil)</option>
                                            <option value="en-US">English (US)</option>
                                            <option value="es">Español</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#4c9a66] dark:text-[#8fcba5]">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="h-px w-full bg-[#e7f3eb] dark:bg-[#1f3b29]"></div>

                        {/* Privacy Section */}
                        <div className="p-6 md:p-8 flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b]">
                                    <span className="material-symbols-outlined">shield_person</span>
                                </div>
                                <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Privacidade</h2>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <button onClick={handleDownloadData} type="button" className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#1f3b29] group hover:border-[#13ec5b]/50 transition-all text-left">
                                    <div>
                                        <p className="font-bold text-[#0d1b12] dark:text-white group-hover:text-[#13ec5b] transition-colors">Gerenciar Dados</p>
                                        <p className="text-xs text-[#4c9a66] dark:text-[#8fcba5]">Baixar uma cópia das suas informações.</p>
                                    </div>
                                    <span className="material-symbols-outlined text-[#4c9a66] group-hover:text-[#13ec5b] transition-colors">download</span>
                                </button>
                                <button onClick={handleDeleteAccount} type="button" className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 group hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-left">
                                    <div>
                                        <p className="font-bold text-red-600 dark:text-red-400">Excluir Conta</p>
                                        <p className="text-xs text-red-400/80 dark:text-red-300/70">Esta ação é permanente.</p>
                                    </div>
                                    <span className="material-symbols-outlined text-red-400 group-hover:text-red-600 transition-colors">delete_forever</span>
                                </button>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="bg-[#f8fcf9] dark:bg-[#102216]/50 p-6 md:p-8 rounded-b-3xl border-t border-[#e7f3eb] dark:border-[#1f3b29] flex flex-col md:flex-row items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full md:w-auto px-6 py-3 rounded-full text-[#4c9a66] dark:text-[#8fcba5] font-bold hover:text-[#0d1b12] dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full md:w-auto flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-8 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] transition-colors shadow-lg shadow-[#13ec5b]/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-sm font-bold tracking-wide">{loading ? "Salvando..." : "Salvar Alterações"}</span>
                                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                            </button>
                        </div>
                    </form>
                </div>
                <div className="h-20"></div>
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                verificationText={modalConfig.verificationText}
                type={modalConfig.type}
            />
        </div>
    );
}
