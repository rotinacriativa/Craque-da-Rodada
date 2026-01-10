"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import { getResilientUser } from "../../../src/lib/auth-helpers";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { GroupCard } from "../../components/player/groups/GroupCard";
import { EmptyGroupsState } from "../../components/player/groups/EmptyGroupsState";

export default function GroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroups() {
            try {
                const user = await getResilientUser(supabase);

                if (!user) {
                    console.warn("[Groups] No resilient user found. Middleware should have handled this.");
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
        return <LoadingSpinner size="lg" message="Carregando suas peladas..." fullScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#0d1b12] dark:text-white tracking-tight mb-2">
                        Minhas Peladas
                    </h1>
                    <p className="text-[#4c9a66] dark:text-[#8baaa0]">
                        Gerencie seus jogos ou entre em uma nova turma.
                    </p>
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
                        <GroupCard key={group.id} group={group} isAdmin={true} />
                    ))}
                </div>
            ) : (
                <EmptyGroupsState />
            )}
        </div>
    );
}
