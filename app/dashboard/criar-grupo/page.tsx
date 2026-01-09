"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import Link from "next/link";

export default function CreateGroupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // 1. Create Group
            const { data: group, error: createError } = await supabase
                .from('groups')
                .insert({
                    name,
                    description,
                    location,
                    city: location, // Mapping location input to city as well for coverage
                    created_by: user.id,
                    visibility: 'public',
                    max_members: 20
                })
                .select()
                .single();

            if (createError) throw createError;

            // 2. Add creator as admin member
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'admin',
                    status: 'active'
                });

            if (memberError) {
                console.error("Error adding admin member:", memberError);
                // Non-blocking but logged
            }

            // Success! Redirect to the new group
            router.push(`/dashboard/grupos/${group.id}`);
            router.refresh();

        } catch (err: any) {
            console.error("Error creating group:", err);
            setError(err.message || "Erro ao criar grupo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8">
                <Link href="/dashboard/grupos" className="text-sm font-bold text-[#4c9a66] hover:text-[#13ec5b] flex items-center gap-1 mb-4 transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Voltar para Meus Grupos
                </Link>
                <h1 className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white mb-2">Criar Novo Grupo</h1>
                <p className="text-[#4c9a66] dark:text-[#8baaa0]">Comece a organizar suas peladas agora mesmo.</p>
            </div>

            <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm">
                <form onSubmit={handleCreateGroup} className="flex flex-col gap-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Group Name */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-[#0d1b12] dark:text-white uppercase tracking-wide">Nome do Grupo *</span>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Boleiros de Terça"
                            className="h-14 px-4 rounded-xl bg-[#f6f8f6] dark:bg-[#102216] border border-[#cfe7d7] dark:border-[#2a4030] focus:border-[#13ec5b] focus:ring-0 outline-none text-[#0d1b12] dark:text-white font-medium transition-all placeholder:text-[#8baaa0]/50"
                        />
                    </label>

                    {/* Location */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-[#0d1b12] dark:text-white uppercase tracking-wide">Cidade / Local *</span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">location_on</span>
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ex: São Paulo, SP"
                                className="h-14 pl-12 pr-4 w-full rounded-xl bg-[#f6f8f6] dark:bg-[#102216] border border-[#cfe7d7] dark:border-[#2a4030] focus:border-[#13ec5b] focus:ring-0 outline-none text-[#0d1b12] dark:text-white font-medium transition-all placeholder:text-[#8baaa0]/50"
                            />
                        </div>
                    </label>

                    {/* Description */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-[#0d1b12] dark:text-white uppercase tracking-wide">Descrição</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Regras, dias de jogo, ou uma frase de efeito..."
                            className="h-32 p-4 rounded-xl bg-[#f6f8f6] dark:bg-[#102216] border border-[#cfe7d7] dark:border-[#2a4030] focus:border-[#13ec5b] focus:ring-0 outline-none text-[#0d1b12] dark:text-white font-medium transition-all resize-none placeholder:text-[#8baaa0]/50"
                        />
                    </label>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-black text-lg uppercase tracking-wide transition-all shadow-lg shadow-[#13ec5b]/20 hover:shadow-[#13ec5b]/30 active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="size-6 border-2 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>Criar Grupo</span>
                                    <span className="material-symbols-outlined">add_circle</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
