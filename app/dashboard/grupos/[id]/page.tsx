"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../src/lib/client";
import { getResilientUser } from "../../../../src/lib/auth-helpers";
import ConfirmationModal from "../../../components/ConfirmationModal";
import NextStepsGuide from "./NextStepsGuide";
import { LoadingSpinner } from "../../../components/shared/LoadingSpinner";
import { ErrorState } from "../../../components/shared/ErrorState";
import { Breadcrumbs } from "../../../components/shared/Breadcrumbs";
import { GroupHeader } from "../../../components/player/groups/GroupHeader";
import { MatchList } from "../../../components/player/groups/MatchList";
import { MembersList } from "../../../components/player/groups/MembersList";
import { AboutSection } from "../../../components/player/groups/AboutSection";

export default function GroupDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [group, setGroup] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteCopied, setInviteCopied] = useState(false);

    // Modals
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Fetch Data Function
    const fetchData = async () => {
        try {
            const user = await getResilientUser(supabase);

            if (!user) {
                console.warn("[Group] No resilient user found. Middleware should have handled this. Waiting for hydration...");
                return;
            }

            setCurrentUser(user);

            // Fetch Group Details
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (groupError) {
                console.error("Error fetching group:", groupError);
                if (groupError.code === 'PGRST116') {
                    setGroup(null);
                    setIsLoading(false);
                    return;
                }
                throw groupError;
            } else {
                setGroup(groupData);
            }

            // Fetch Matches
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*, match_participants(user_id)')
                .eq('group_id', groupId)
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true });

            if (matchesError) {
                console.error("Error fetching matches:", matchesError);
                throw matchesError;
            }
            setMatches(matchesData || []);

            // Fetch Members
            const { data: membersRaw, error: membersError } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', groupId)
                .eq('status', 'active');

            if (membersError) {
                console.error("Error fetching members:", membersError);
                throw membersError;
            }

            // Manually Fetch Profiles for Members
            let membersWithProfiles = [];
            if (membersRaw && membersRaw.length > 0) {
                const userIds = membersRaw.map((m: any) => m.user_id);

                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);

                if (profilesError) {
                    console.error("Error fetching profiles:", profilesError);
                }

                membersWithProfiles = membersRaw.map((member: any) => {
                    const profile = profilesData?.find((p: any) => p.id === member.user_id);
                    return { ...member, profile };
                });
            }

            setMembers(membersWithProfiles);

            // Check Member Role
            if (user) {
                const currentUserMember = membersWithProfiles.find((m: any) => m.user_id === user.id);
                if (currentUserMember) {
                    setUserRole(currentUserMember.role);
                }
            }

        } catch (error: any) {
            console.error("Error loading dashboard:", error);
            setError("Erro ao carregar dados do grupo. Tente recarregar a página.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchData();
        }
    }, [groupId, router]);

    const handleInvite = async () => {
        if (!group) return;
        // Adiciona ?join=1 para forçar entrada automática
        const urlObj = new URL(window.location.href);
        urlObj.searchParams.set('join', '1');
        const url = urlObj.toString();

        // Função de cópia com múltiplos fallbacks
        const copyToClipboard = async (text: string): Promise<boolean> => {
            // Método 1: Clipboard API (moderno, requer HTTPS)
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (err) {
                    console.warn('Clipboard API failed:', err);
                }
            }

            // Método 2: document.execCommand (fallback antigo mas funciona)
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) return true;
            } catch (err) {
                console.warn('execCommand failed:', err);
            }

            return false;
        };

        const shareData = {
            title: `Convite para ${group.name}`,
            text: `Vem jogar com a gente no grupo ${group.name}!`,
            url: url,
        };

        // Tentar compartilhamento nativo APENAS se estiver em mobile (evita erro no Windows Desktop)
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (navigator.share && isMobile) {
            try {
                await navigator.share(shareData);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 3000);
                return;
            } catch (error) {
                // Se usuário cancelou, não fazer nada
                if ((error as any).name === 'AbortError') {
                    return;
                }
                // Se falhou por outro motivo, tentar copiar
                console.log('Share failed, trying copy');
            }
        }

        // Fallback: copiar para clipboard
        const success = await copyToClipboard(url);
        if (success) {
            setInviteCopied(true);
            setTimeout(() => setInviteCopied(false), 3000);
        } else {
            // Último recurso: mostrar prompt para copiar manualmente
            alert(`Link do grupo:\n\n${url}\n\nCopie e compartilhe com seus amigos!`);
        }
    };

    const handleLeaveGroup = () => {
        setIsLeaveModalOpen(true);
    };

    const confirmLeaveGroup = async () => {
        if (!currentUser) return;
        setIsLeaving(true);

        try {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            console.error("Error leaving group:", error);
            alert("Erro ao sair do grupo: " + error.message);
            setIsLeaving(false);
            setIsLeaveModalOpen(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!currentUser || !group) return;
        setIsJoining(true);

        try {
            // Check if already requested (pending)
            const { data: existingMember } = await supabase
                .from('group_members')
                .select('status')
                .eq('group_id', groupId)
                .eq('user_id', currentUser.id)
                .single();

            if (existingMember) {
                if (existingMember.status === 'pending') {
                    alert("Você já enviou uma solicitação para este grupo. Aguarde a aprovação do administrador.");
                    return;
                } else if (existingMember.status === 'banned') {
                    alert("Você foi banido deste grupo e não pode entrar novamente.");
                    return;
                }
                // If active, logic error elsewhere (should have userRole), but handle gracefully -> reload
                window.location.reload();
                return;
            }

            const { error } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: currentUser.id,
                    role: 'member',
                    status: group.manual_approval ? 'pending' : 'active',
                    payment_type: 'DIARISTA'
                });

            if (error) throw error;

            if (group.manual_approval) {
                alert("Solicitação enviada! Aguarde a aprovação do administrador.");
                // Update local state to reflect pending status if we wanted to be fancy, but reload is safer
            } else {
                // Success
                // Force a reload to refresh all data and permissions
                window.location.reload();
            }

        } catch (error: any) {
            console.error("Error joining group:", error);
            alert("Erro ao entrar no grupo: " + (error.message || "Erro desconhecido"));
        } finally {
            setIsJoining(false);
        }
    };

    // Auto-Join Effect
    useEffect(() => {
        const shouldJoin = searchParams.get('join') === '1';
        if (shouldJoin && !isLoading && currentUser && group && !userRole && !isJoining) {
            // Remover o parametro da URL para não ficar tentando entrar em loop se der erro
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            // Tentar entrar
            handleJoinGroup();
        }
    }, [isLoading, currentUser, group, userRole, searchParams]);

    const isAdmin = (currentUser && group && currentUser.id === group.created_by) || (userRole === 'admin' || userRole === 'owner');

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Carregando pelada..." fullScreen />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    if (!isLoading && !group) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px] text-center p-8">
                <div className="bg-gray-100 dark:bg-[#1f3b29] p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-3xl text-gray-500 dark:text-gray-400">search_off</span>
                </div>
                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white mb-2">Pelada não encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                    Não encontramos nenhuma pelada com este link. Verifique o endereço ou peça um novo convite.
                </p>
                <Link
                    href="/dashboard"
                    className="px-6 py-2.5 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-colors shadow-lg shadow-[#13ec5b]/20"
                >
                    Voltar ao Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center w-full">
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/dashboard' },
                        { label: 'Minhas Peladas', href: '/dashboard/grupos' },
                        { label: group.name }
                    ]}
                />

                {/* Next Steps Guide */}
                <NextStepsGuide
                    isAdmin={!!isAdmin}
                    membersCount={members.length}
                    matchesCount={matches.length}
                    groupId={groupId}
                    onInvite={handleInvite}
                />

                {/* Group Header */}
                <GroupHeader
                    group={group}
                    isAdmin={isAdmin}
                    groupId={groupId}
                    inviteCopied={inviteCopied}
                    onInvite={handleInvite}
                />

                {/* Join Group Banner (if not member) */}
                {!userRole && group && (
                    <div className="w-full bg-white dark:bg-[#1a2c22] border-l-4 border-[#13ec5b] rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#13ec5b]/10 p-3 rounded-full text-[#13ec5b]">
                                <span className="material-symbols-outlined text-3xl">group_add</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Participe deste grupo!</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    {group.manual_approval
                                        ? "Este grupo requer aprovação. Solicite sua entrada para jogar."
                                        : "Entre agora para confirmar presença nos jogos e acompanhar as estatísticas."}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleJoinGroup}
                            disabled={isJoining}
                            className="w-full md:w-auto px-8 py-4 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-black rounded-xl text-lg shadow-lg shadow-[#13ec5b]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {isJoining ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <span>Entrar no Grupo</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Leave Group Button (Only for members) */}
                {userRole && (
                    <div className="flex items-center justify-end">
                        <button
                            onClick={handleLeaveGroup}
                            className="group flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 font-semibold text-sm transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            <span>Sair da Pelada</span>
                        </button>
                    </div>
                )}

                {/* Layout Grid: Main Content & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 w-full max-w-6xl mx-auto">
                    {/* Left Column: Matches */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Próximos Jogos</h2>
                            <span className="text-sm font-medium text-gray-400 cursor-not-allowed" title="Em breve">
                                Ver histórico
                            </span>
                        </div>

                        <MatchList matches={matches} groupId={groupId} isLoading={false} />
                    </div>

                    {/* Right Column: Info & Members */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <AboutSection description={group.description} />
                        <MembersList
                            members={members}
                            groupId={groupId}
                            isAdmin={isAdmin}
                            onInvite={handleInvite}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={confirmLeaveGroup}
                title="Sair da Pelada"
                message={`Tem certeza que deseja sair de "${group?.name}"? Você perderá acesso aos jogos e histórico.`}
                confirmText="Sair da Pelada"
                cancelText="Ficar"
                type="danger"
                isLoading={isLeaving}
            />
        </div>
    );
}
