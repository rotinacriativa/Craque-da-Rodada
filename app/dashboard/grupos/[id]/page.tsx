"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../src/lib/client";
import { formatDateForGroup } from "../../../../src/lib/utils";
import ConfirmationModal from "../../../components/ConfirmationModal";

export default function GroupDashboard({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [group, setGroup] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Fetch Data Function
    const fetchData = async () => {
        try {
            // Get Current User
            const { data: { user } } = await supabase.auth.getUser();
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

            // Fetch Matches (Lookup User ID only)
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

            // Fetch Members (Active) - WITHOUT JOIN
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
                    // We don't throw here to avoid crashing if just profiles fail, but ideally we should know
                    // For now, let's proceed with potentially missing profiles
                }

                // Merge
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

    // Initial Fetch
    useEffect(() => {
        if (groupId) {
            fetchData();
        }
    }, [groupId, router]);

    // Helper to get profile from matches
    const getMemberProfile = (userId: string) => {
        return members.find(m => m.user_id === userId)?.profile;
    };



    const [inviteCopied, setInviteCopied] = useState(false);

    const handleInvite = async () => {
        if (!group) return;
        const url = window.location.href;

        // Fallback for copying
        const copyToClipboard = async (text: string) => {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error('Failed to copy:', err);
                return false;
            }
        };

        const shareData = {
            title: `Convite para ${group.name}`,
            text: `Vem jogar com a gente no grupo ${group.name}!`,
            url: url,
        };

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                // If user cancelled, do nothing. If error, fall through to copy.
                if ((error as any).name !== 'AbortError') {
                    console.log('Share failed, trying copy');
                } else {
                    return; // User cancelled
                }
            }
        }

        // Fallback to clipboard
        const success = await copyToClipboard(url);
        if (success) {
            setInviteCopied(true);
            setTimeout(() => setInviteCopied(false), 3000);
        } else {
            prompt('Copie o link do grupo:', url);
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

            // Success feedback happens via modal close or redirect, but let's pause briefly
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            console.error("Error leaving group:", error);
            alert("Erro ao sair do grupo: " + error.message);
            setIsLeaving(false);
            setIsLeaveModalOpen(false);
        }
    };

    const isAdmin = (currentUser && group && currentUser.id === group.created_by) || (userRole === 'admin' || userRole === 'owner');

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px]">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
                <span className="mt-4 text-sm text-gray-500 font-medium">Carregando pelada...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px] text-center p-8">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Ops! Algo deu errado.</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full font-bold transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!isLoading && !group) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px] text-center p-8">
                <div className="bg-gray-100 dark:bg-[#1f3b29] p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-3xl text-gray-500 dark:text-gray-400">search_off</span>
                </div>
                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white mb-2">Pelada não encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">Não encontramos nenhuma pelada com este link. Verifique o endereço ou peça um novo convite.</p>
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
                <div className="flex items-center gap-2 text-sm">
                    <Link className="text-gray-500 hover:text-[#13ec5b] transition-colors" href="/dashboard">Home</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500 hover:text-[#13ec5b] transition-colors cursor-pointer">Minhas Peladas</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-[#0d1b12] dark:text-white font-medium">{group.name}</span>
                </div>

                {/* Profile Header */}
                <div className="bg-white dark:bg-[#183020] rounded-xl p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#1f3b29] relative overflow-hidden">
                    {/* Decorative background accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#13ec5b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-[#2a4031] shadow-lg shrink-0" style={{ backgroundImage: `url('${group.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBAWsYSD4QUg5Dl-clEdk83X_QgSxSVG2WM3lkat68NIljcbUgzR7QiKtjxf7IrPN4Eq8cyxdXgBBDkXPwk7TUO9yobssnmmpHaDRjy-iJNy8GieFaqF9w4jVQ8IHZp2w91KUGbPWHPtyG6yDl6q1ZEOyc55gfkZq6_y5BOGhmnoJsbBX0i29wJyfIyIseLT2r2cTFMwOoLpQXjBtuGSzPxjnLfaEIEswJNEkZqVkvIFlSae6e_G8XoeyBTjua-r32qNHn5FvWE-Mw"}')` }}></div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{group.name}</h1>
                                    {isAdmin ? (
                                        <span className="px-3 py-1 bg-[#13ec5b] text-[#102216] text-xs font-bold uppercase rounded-full tracking-wide shadow-sm shadow-[#13ec5b]/20">Admin</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-[#13ec5b]/20 text-[#0ea841] dark:text-[#13ec5b] text-xs font-bold uppercase rounded-full tracking-wide">Membro</span>
                                    )}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">{group.description || "Sem descrição."}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        <span>Desde {new Date(group.created_at).getFullYear()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        <span>{group.location || "Local não definido"}</span>
                                    </div>
                                    <button
                                        onClick={handleInvite}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all ${inviteCopied
                                            ? "bg-green-600 text-white shadow-lg scale-105"
                                            : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a4031] dark:hover:bg-[#35503d] text-[#0d1b12] dark:text-white"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {inviteCopied ? "check_circle" : "share"}
                                        </span>
                                        <span>{inviteCopied ? "Link Copiado!" : "Convidar galera"}</span>
                                    </button>

                                    {/* Create Match (Always visible for simplified flow or check logic later) */}
                                    <Link
                                        href={`/dashboard/grupos/${groupId}/nova-partida`}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-colors shadow-lg shadow-black/10"
                                    >
                                        <span className="material-symbols-outlined text-lg">add_circle</span>
                                        <span>Criar Pelada</span>
                                    </Link>

                                    {/* Admin Button - Only visible if admin */}
                                    {isAdmin && (
                                        <Link
                                            href={`/dashboard/grupos/${groupId}/admin`}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1b12] hover:bg-[#1a2c20] dark:bg-white dark:hover:bg-gray-200 text-white dark:text-[#0d1b12] rounded-full font-bold transition-colors shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            <span>Gerenciar</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLeaveGroup}
                                className="group flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 font-semibold text-sm transition-all w-full md:w-auto"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span>Sair da Pelada</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Layout Grid: Main Content & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 w-full max-w-6xl mx-auto">
                    {/* Left Column: Matches (Main Focus) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Próximos Jogos</h2>
                            <span className="text-sm font-medium text-gray-400 cursor-not-allowed" title="Em breve">Ver histórico</span>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <span className="size-8 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
                            </div>
                        ) : matches.length > 0 ? (
                            matches.map((match) => {
                                const dateInfo = formatDateForGroup(match.date);
                                return (
                                    <div key={match.id} className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#13ec5b]/30 shadow-[0_4px_20px_-4px_rgba(19,236,91,0.15)] transition-transform hover:-translate-y-1 duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* Date Badge */}
                                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] rounded-2xl shrink-0">
                                                    <span className="text-xs font-bold uppercase tracking-wider">{dateInfo.month}</span>
                                                    <span className="text-2xl font-black leading-none">{dateInfo.day}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">{match.name}</h3>
                                                        <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase border border-green-200 dark:border-green-800">Confirmado</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                            <span>{match.start_time.slice(0, 5)} - {match.end_time.slice(0, 5)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                            <span className="truncate max-w-[250px]">{match.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center sm:self-center gap-3 mt-2 sm:mt-0">
                                                {/* Avatars */}
                                                <div className="flex -space-x-2 mr-2 hidden md:flex">
                                                    {match.match_participants && match.match_participants.slice(0, 3).map((participant: any) => (
                                                        <div
                                                            key={participant.user_id}
                                                            className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-200 bg-cover"
                                                            style={{ backgroundImage: `url('${participant.profile?.avatar_url || ""}')` }}
                                                        >
                                                            {!participant.profile?.avatar_url && (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                                    ?
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {match.match_participants && match.match_participants.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                            +{match.match_participants.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <Link href={`/dashboard/partidas/${match.id}`} className="w-full sm:w-auto bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm shadow-[#13ec5b]/30 flex items-center justify-center gap-2">
                                                    <span>Ver partida</span>
                                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-gray-50 dark:bg-[#183020] border-2 border-dashed border-gray-200 dark:border-[#2a4031]">
                                <div className="bg-[#13ec5b]/10 p-4 rounded-full mb-4">
                                    <span className="material-symbols-outlined text-3xl text-[#0ea841] dark:text-[#13ec5b]">sports_soccer</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white mb-2">Nenhum jogo marcado</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">A bola não pode parar! Marque o próximo jogo da galera.</p>
                                <Link
                                    href={`/dashboard/grupos/${groupId}/nova-partida`}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-all shadow-lg hover:shadow-[#13ec5b]/20"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Marcar Jogo
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Members */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* About Card */}
                        <div className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#e7f3eb] dark:border-[#1f3b29]">
                            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#13ec5b]">info</span>
                                Sobre a Pelada
                            </h3>
                            <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                                <p className="mb-3 text-sm leading-relaxed">
                                    {group.description || "O administrador ainda não adicionou uma descrição para esta pelada."}
                                </p>
                            </div>
                        </div>

                        {/* Members Card */}
                        <div className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#e7f3eb] dark:border-[#1f3b29]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#13ec5b]">groups</span>
                                    Jogadores ({members.length})
                                </h3>
                                {isAdmin ? (
                                    <Link className="text-xs font-bold text-[#0ea841] dark:text-[#13ec5b] hover:underline" href={`/dashboard/grupos/${groupId}/admin/membros`}>Ver todos</Link>
                                ) : (
                                    <span className="text-xs font-bold text-gray-400 cursor-not-allowed" title="Em breve">Ver todos</span>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {members.slice(0, 7).map((member) => (
                                    <div key={member.id} className="flex flex-col items-center gap-1">
                                        <div className="relative">
                                            {member.profile?.avatar_url ? (
                                                <div className={`w-12 h-12 rounded-full bg-cover bg-center border-2 ${member.role === 'admin' || member.role === 'owner' ? 'border-[#13ec5b]' : 'border-gray-200 dark:border-[#2a4031]'}`} style={{ backgroundImage: `url('${member.profile.avatar_url}')` }}></div>
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold border-2 ${member.role === 'admin' || member.role === 'owner' ? 'border-[#13ec5b]' : 'border-gray-200 dark:border-[#2a4031]'}`}>
                                                    {member.profile?.full_name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                            )}
                                            {(member.role === 'admin' || member.role === 'owner') && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-[#1c2e22]">ADM</div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">
                                            {member.profile?.full_name?.split(' ')[0] || "Usuário"}
                                        </span>
                                    </div>
                                ))}

                                {members.length > 7 && (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-12 h-12 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#0ea841] dark:text-[#13ec5b] font-bold text-sm hover:bg-[#13ec5b]/20 transition-colors cursor-pointer">
                                            +{members.length - 7}
                                        </div>
                                        <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Outros</span>
                                    </div>
                                )}

                                {members.length === 0 && (
                                    <div className="col-span-4 flex flex-col items-center justify-center py-6 text-center">
                                        <div className="bg-gray-100 dark:bg-[#102216] p-3 rounded-full mb-3">
                                            <span className="material-symbols-outlined text-gray-400 text-2xl">person_off</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-[#0d1b12] dark:text-white mb-1">Cadê a galera?</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-[200px]">O time tá vazio. Convide os jogadores para começar.</p>
                                        <button
                                            onClick={handleInvite}
                                            className="text-xs font-bold text-[#0d1b12] bg-[#13ec5b] hover:bg-[#0fd650] px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">share</span>
                                            Chamar Jogadores
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
