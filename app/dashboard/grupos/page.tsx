"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";

export default function GroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroups() {
            try {
                // 1. Get Current User with Multi-Stage Check (Resilient for Mobile)
                let { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    console.log("No user found on first check, waiting for hydration...");
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const { data: { user: retryUser } } = await supabase.auth.getUser();
                    user = retryUser;
                }

                if (!user) {
                    console.log("Final auth check failed, redirecting to login");
                    router.push("/login");
                    return;
                }

                // Fetch groups I am a member of (including created ones)
                const { data: membershipData, error: memberError } = await supabase
                    .from('group_members')
                    .select('group_id')
                    .eq('user_id', user.id)
                    .eq('status', 'active');

                if (memberError) throw memberError;

                const groupIds = membershipData?.map(m => m.group_id) || [];

                if (groupIds.length > 0) {
                    const { data: groupsData, error: groupsError } = await supabase
                        .from('groups')
                        .select('*')
                        .in('id', groupIds)
                        .order('created_at', { ascending: false });

                    if (groupsError) throw groupsError;
                    setGroups(groupsData || []);
                } else {
                    setGroups([]);
                }
            } catch (err) {
                console.error("Error fetching groups:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <span className="size-10 border-4 border-[#13ec5b] border-r-transparent rounded-full animate-spin"></span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white tracking-tight mb-2">Minhas Peladas</h1>
                    <p className="text-[#4c9a66] dark:text-[#8baaa0]">Gerencie seus jogos ou entre em uma nova turma.</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/dashboard/entrar-grupo"
                        className="h-12 px-6 rounded-full border-2 border-[#e7f3eb] dark:border-[#2a4535] text-[#0d1b12] dark:text-white font-bold flex items-center gap-2 hover:bg-[#f6f8f6] dark:hover:bg-[#1a2c20] transition-colors"
                    >
                        <span className="material-symbols-outlined">group_add</span>
                        Entrar na Pelada
                    </Link>
                    <Link
                        href="/dashboard/criar-grupo"
                        className="h-12 px-6 rounded-full bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#13ec5b]/20"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Criar Pelada
                    </Link>
                </div>
            </div>

            {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <Link
                            key={group.id}
                            href={`/dashboard/grupos/${group.id}`}
                            className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 border border-[#e7f3eb] dark:border-[#2a4535] hover:border-[#13ec5b] hover:shadow-xl hover:shadow-[#13ec5b]/10 transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="size-14 rounded-2xl bg-gray-100 dark:bg-[#102216] bg-cover bg-center border-2 border-white dark:border-[#2a4535] shadow-sm" style={{ backgroundImage: group.image_url ? `url('${group.image_url}')` : 'none' }}>
                                    {!group.image_url && <span className="flex h-full w-full items-center justify-center text-2xl">⚽</span>}
                                </div>
                                <span className="px-3 py-1 bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] text-xs font-bold uppercase rounded-full">
                                    Admin
                                </span>
                            </div>

                            <h3 className="font-bold text-xl text-[#0d1b12] dark:text-white mb-2 line-clamp-1">{group.name}</h3>
                            <p className="text-sm text-[#4c9a66] dark:text-[#8baaa0] line-clamp-2 mb-6 flex-1">
                                {group.description || "Sem descrição definida."}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-[#0d1b12] dark:text-white mt-auto pt-4 border-t border-[#f0f7f2] dark:border-[#2a4535] group-hover:text-[#13ec5b] transition-colors">
                                <span>Acessar Painel</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[3rem] bg-white dark:bg-[#1a2c20] border-2 border-dashed border-[#e7f3eb] dark:border-[#2a4535]">
                    <div className="bg-[#13ec5b]/10 p-6 rounded-full mb-6 animate-pulse">
                        <span className="material-symbols-outlined text-5xl text-[#0ea841] dark:text-[#13ec5b]">sports_soccer</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#0d1b12] dark:text-white mb-3">Nenhuma pelada por aqui</h2>
                    <p className="text-[#4c9a66] dark:text-[#8baaa0] mb-8 max-w-sm text-lg">
                        Tá parado por quê? Crie sua pelada ou entre na de um parceiro para começar a resenha.
                    </p>
                    <Link
                        href="/dashboard/criar-grupo"
                        className="h-14 px-8 rounded-full bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold flex items-center gap-2 transition-all shadow-xl shadow-[#13ec5b]/20 hover:scale-105"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Criar Pelada
                    </Link>
                </div>
            )}
        </div>
    );
}
