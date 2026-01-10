"use client";

import { useState } from "react";
import { supabase } from "../../src/lib/client";
import { toast } from "sonner";

interface CompleteProfileModalProps {
    isOpen: boolean;
    userId: string;
    onComplete: (data?: { full_name: string; avatar_url: string | null }) => void;
    initialData?: {
        full_name?: string;
        position?: string;
        skill_level?: string;
        avatar_url?: string;
    };
}

export default function CompleteProfileModal({ isOpen, userId, onComplete, initialData }: CompleteProfileModalProps) {
    const [fullName, setFullName] = useState(initialData?.full_name || "");
    const [position, setPosition] = useState(initialData?.position || "");
    const [skillLevel, setSkillLevel] = useState(initialData?.skill_level || "");
    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || null);

    // UI States
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setIsUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`; // Use Date.now() for uniqueness
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error("Erro ao fazer upload da foto.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!fullName.trim()) {
            setError("Por favor, preencha seu nome.");
            return;
        }
        if (!position || position === "") {
            setError("Por favor, selecione sua posição.");
            return;
        }
        if (!skillLevel || skillLevel === "") {
            setError("Por favor, selecione seu nível.");
            return;
        }

        setIsLoading(true);

        try {
            console.log("Updating profile for user:", userId);
            const updates = {
                id: userId,
                full_name: fullName,
                position: position,
                skill_level: skillLevel,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error: updateError } = await supabase
                .from("profiles")
                .upsert(updates)

            if (updateError) {
                console.error("Supabase update error:", updateError);
                throw updateError;
            }

            console.log("Profile updated successfully");
            toast.success("Perfil atualizado com sucesso!");

            // Give a small delay for user to see success state if needed, or close immediately
            setTimeout(() => {
                onComplete({ full_name: fullName, avatar_url: avatarUrl });
            }, 500);

        } catch (err: any) {
            console.error("Catch error updating profile:", err);
            setError("Erro ao salvar perfil: " + (err.message || "Erro desconhecido"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1a2c22] rounded-3xl w-full max-w-md shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 relative">

                {/* Decorative Background Mesh */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#13ec5b] to-[#0ea841] opacity-90 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-0"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center pt-8 px-6">
                    {/* Avatar Upload */}
                    <div className="relative mb-4 group">
                        <label className={`block w-28 h-28 rounded-full bg-white dark:bg-[#0d1b12] shadow-xl cursor-pointer overflow-hidden border-4 border-white dark:border-[#2a4032] transition-transform group-hover:scale-105 relative ${isUploading ? 'opacity-70' : ''}`}>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={isUploading}
                            />
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-[#203529]">
                                    <span className="material-symbols-outlined text-4xl mb-1">add_a_photo</span>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-2xl">edit</span>
                            </div>

                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-20">
                                    <span className="material-symbols-outlined animate-spin text-3xl">rss_feed</span>
                                </div>
                            )}
                        </label>
                        <div className="absolute bottom-1 right-1 bg-[#13ec5b] text-[#0d1b12] rounded-full p-1.5 shadow-md border-2 border-white dark:border-[#1a2c22] flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-[16px] font-bold">camera_alt</span>
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-[#0d1b12] dark:text-white uppercase tracking-tight">Bem-vindo, Craque!</h2>
                        <p className="text-gray-500 dark:text-gray-300 font-medium text-sm mt-1">Complete sua ficha técnica para entrar em campo.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full space-y-4 pb-8">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-xl font-bold text-center border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Nome ou Apelido</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] focus:ring-2 focus:ring-[#13ec5b] outline-none transition-all font-semibold text-[#0d1b12] dark:text-white placeholder-gray-400"
                                    placeholder="Como quer ser chamado?"
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Posição</label>
                                <div className="relative">
                                    <select
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        className="w-full pl-10 pr-8 py-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] focus:ring-2 focus:ring-[#13ec5b] outline-none transition-all font-semibold text-[#0d1b12] dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Goleiro">Goleiro</option>
                                        <option value="Zagueiro">Zagueiro</option>
                                        <option value="Lateral">Lateral</option>
                                        <option value="Meio-Campo">Meio-Campo</option>
                                        <option value="Atacante">Atacante</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">sports_soccer</span>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Nível</label>
                                <div className="relative">
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(e.target.value)}
                                        className="w-full pl-10 pr-8 py-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] focus:ring-2 focus:ring-[#13ec5b] outline-none transition-all font-semibold text-[#0d1b12] dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Iniciante">Iniciante</option>
                                        <option value="Intermediário">Intermediário</option>
                                        <option value="Avançado">Avançado</option>
                                        <option value="Craque">Craque</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">equalizer</span>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-black rounded-xl text-lg shadow-lg shadow-[#13ec5b]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Confirmar e Entrar</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
