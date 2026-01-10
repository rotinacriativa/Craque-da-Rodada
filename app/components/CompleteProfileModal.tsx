"use client";

import { useState } from "react";
import { supabase } from "../../src/lib/client";

interface CompleteProfileModalProps {
    isOpen: boolean;
    userId: string;
    onComplete: () => void;
    initialData?: {
        full_name?: string;
        position?: string;
        skill_level?: string;
    };
}

export default function CompleteProfileModal({ isOpen, userId, onComplete, initialData }: CompleteProfileModalProps) {
    const [fullName, setFullName] = useState(initialData?.full_name || "");
    const [position, setPosition] = useState(initialData?.position || "");
    const [skillLevel, setSkillLevel] = useState(initialData?.skill_level || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName.trim() || !position || !skillLevel) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setIsLoading(true);

        try {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    position: position,
                    skill_level: skillLevel,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId);

            if (updateError) throw updateError;

            onComplete();
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError("Erro ao salvar perfil. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1a2c22] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-[#2a4032] overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="bg-[#13ec5b] p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-[#13ec5b]">person_edit</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#0d1b12] uppercase tracking-tight">Complete seu Perfil</h2>
                    <p className="text-[#0d1b12]/80 font-medium text-sm mt-1">Para entrar em campo, precisamos dos seus dados!</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Nome Completo (ou Apelido)</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] focus:ring-2 focus:ring-[#13ec5b] outline-none transition-all font-semibold"
                            placeholder="Ex: João Silva"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Posição</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] focus:ring-2 focus:ring-[#13ec5b] outline-none transition-all font-semibold appearance-none"
                            >
                                <option value="">Selecione...</option>
                                <option value="Goleiro">Goleiro</option>
                                <option value="Zagueiro">Zagueiro</option>
                                <option value="Lateral">Lateral</option>
                                <option value="Meio-Campo">Meio-Campo</option>
                                <option value="Atacante">Atacante</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">Nível</label>
                            <select
                                value={skillLevel}
                                onChange={(e) => setSkillLevel(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-200 dark:border-[#2a4032] focus:ring-2 focus:ring-[#13ec5b] outline-none transition-all font-semibold appearance-none"
                            >
                                <option value="">Selecione...</option>
                                <option value="Iniciante">Iniciante ⭐</option>
                                <option value="Intermediário">Intermediário ⭐⭐⭐</option>
                                <option value="Avançado">Avançado ⭐⭐⭐⭐⭐</option>
                                <option value="Craque">Craque 🔥</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-black rounded-xl text-lg shadow-lg shadow-[#13ec5b]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">refresh</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <span>Salvar e Entrar</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>

                    <p className="text-gray-400 text-xs text-center px-4">
                        Essas informações ajudam a equilibrar os times nas peladas.
                    </p>
                </form>
            </div>
        </div>
    );
}
