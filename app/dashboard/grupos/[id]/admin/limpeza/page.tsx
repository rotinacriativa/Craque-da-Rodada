"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../../src/lib/client";
import { getResilientUser } from "../../../../../../src/lib/auth-helpers";
import Link from "next/link";

export default function CleanupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    const [members, setMembers] = useState<any[]>([]);
    const [matchesCount, setMatchesCount] = useState(0);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [deletingMatches, setDeletingMatches] = useState(false);

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const fetchData = async () => {
        try {
            // 1. Get Current User with Multi-Stage Check (Resilient for Mobile)
            const user = await getResilientUser(supabase);

            if (!user) {
                router.push("/login");
                return;
            }
            setCurrentUser(user);

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('*, profile:profiles(full_name, avatar_url)')
                .eq('group_id', groupId);

            if (membersError) throw membersError;

            // Manual profile fetch if join failed (similar to dashboard logic)
            let membersWithProfiles = membersData;
            if (membersData && membersData.length > 0 && !membersData[0].profile) {
                const userIds = membersData.map((m: any) => m.user_id);
                const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
                membersWithProfiles = membersData.map(m => ({
                    ...m,
                    profile: profiles?.find(p => p.id === m.user_id)
                }));
            }

            setMembers(membersWithProfiles || []);

            // Fetch Matches Count
            const { count: mCount } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', groupId);

            setMatchesCount(mCount || 0);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFakeMembers = async () => {
        if (!currentUser) return;

        const membersToDelete = members.filter(m => m.user_id !== currentUser.id);
        const count = membersToDelete.length;

        if (count === 0) {
            alert("Não há outros membros para deletar.");
            return;
        }

        if (!confirm(`TEM CERTEZA? Isso excluirá ${count} membros do grupo, mantendo APENAS VOCÊ. Essa ação não pode ser desfeita.`)) {
            return;
        }

        setDeleting(true);

        try {
            const idsToDelete = membersToDelete.map(m => m.id);

            const { error } = await supabase
                .from('group_members')
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            alert(`Sucesso! ${count} membros foram removidos. Agora só você está no grupo.`);
            fetchData(); // Refresh

        } catch (error: any) {
            console.error("Error deleting members:", error);
            alert("Erro ao deletar membros: " + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteAllMatches = async () => {
        if (!currentUser) return;

        if (matchesCount === 0) {
            alert("Não há partidas para deletar.");
            return;
        }

        if (!confirm(`TEM CERTEZA? Isso excluirá TODAS AS ${matchesCount} PARTIDAS deste grupo. Esta ação é IRREVERSÍVEL e removerá todos os dados de votação e participação.`)) {
            return;
        }

        setDeletingMatches(true);

        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .eq('group_id', groupId);

            if (error) throw error;

            alert(`Sucesso! Todas as partidas foram removidas.`);
            fetchData();
        } catch (error: any) {
            console.error("Error deleting matches:", error);
            alert("Erro ao deletar partidas: " + error.message);
        } finally {
            setDeletingMatches(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando...</div>;

    const fakeMembers = members.filter(m => m.user_id !== currentUser?.id);

    return (
        <div className="flex-1 p-8 max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm mb-4">
                <Link className="text-gray-500 hover:text-[#13ec5b]" href={`/dashboard/grupos/${groupId}/admin`}>Voltar para Admin</Link>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-red-500">Limpeza de Dados</span>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    Zona de Perigo: Limpeza de Membros
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
                    Esta ferramenta foi criada para remover todos os dados de teste (jogadores "fakes") do seu grupo de uma só vez.
                </p>

                <div className="bg-white dark:bg-[#1a2c20] p-4 rounded-xl border border-gray-200 dark:border-[#2a4032] mb-6">
                    <h3 className="font-bold mb-3">Resumo da Ação:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Total de membros no grupo: <strong>{members.length}</strong></li>
                        <li>Você (Admin): <strong>{currentUser?.email}</strong> (MANTIDO)</li>
                        <li className="text-red-600 font-bold">Membros a serem EXCLUÍDOS: {fakeMembers.length}</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-2 mb-6 max-h-60 overflow-y-auto bg-white dark:bg-[#1a2c20] rounded-xl border border-gray-200 dark:border-[#2a4032] p-2">
                    {fakeMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-2 p-2 border-b border-gray-100 dark:border-[#2a4032] last:border-0 text-sm">
                            <span className="material-symbols-outlined text-gray-400 text-sm">person_remove</span>
                            <span className="font-medium">{m.profile?.full_name || "Sem Nome"}</span>
                            <span className="text-xs text-gray-400 ml-auto">{m.user_id}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleDeleteFakeMembers}
                    disabled={deleting || fakeMembers.length === 0}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {deleting ? (
                        <>
                            <span className="size-5 border-2 border-white border-r-transparent rounded-full animate-spin"></span>
                            Limpando...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">delete_forever</span>
                            Confirmar Limpeza (Manter apenas EU)
                        </>
                    )}
                </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">delete_sweep</span>
                    Limpeza de Partidas
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
                    Remova todas as partidas cadastradas neste grupo para começar do zero.
                </p>

                <div className="bg-white dark:bg-[#1a2c20] p-4 rounded-xl border border-gray-200 dark:border-[#2a4032] mb-6">
                    <h3 className="font-bold mb-3">Resumo da Ação:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Total de partidas no grupo: <strong>{matchesCount}</strong></li>
                        <li className="text-amber-600 font-bold">TODAS as partidas serão EXCLUÍDAS.</li>
                    </ul>
                </div>

                <button
                    onClick={handleDeleteAllMatches}
                    disabled={deletingMatches || matchesCount === 0}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {deletingMatches ? (
                        <>
                            <span className="size-5 border-2 border-white border-r-transparent rounded-full animate-spin"></span>
                            Limpando Partidas...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">delete_sweep</span>
                            Excluir Todas as Partidas
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
