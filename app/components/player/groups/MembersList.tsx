import Link from "next/link";

interface Member {
    id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    profile?: {
        full_name: string;
        avatar_url: string | null;
    };
}

interface MembersListProps {
    members: Member[];
    groupId: string;
    isAdmin: boolean;
    onInvite: () => void;
}

export function MembersList({ members, groupId, isAdmin, onInvite }: MembersListProps) {
    return (
        <div className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#e7f3eb] dark:border-[#1f3b29]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#13ec5b]">groups</span>
                    Jogadores ({members.length})
                </h3>
                {isAdmin ? (
                    <Link
                        className="text-xs font-bold text-[#0ea841] dark:text-[#13ec5b] hover:underline"
                        href={`/dashboard/grupos/${groupId}/admin/membros`}
                    >
                        Ver todos
                    </Link>
                ) : (
                    <span className="text-xs font-bold text-gray-400 cursor-not-allowed" title="Em breve">
                        Ver todos
                    </span>
                )}
            </div>

            <div className="grid grid-cols-4 gap-3">
                {members.slice(0, 7).map((member) => (
                    <div key={member.id} className="flex flex-col items-center gap-1">
                        <div className="relative">
                            {member.profile?.avatar_url ? (
                                <div
                                    className={`w-12 h-12 rounded-full bg-cover bg-center border-2 ${member.role === 'admin' || member.role === 'owner'
                                            ? 'border-[#13ec5b]'
                                            : 'border-gray-200 dark:border-[#2a4031]'
                                        }`}
                                    style={{ backgroundImage: `url('${member.profile.avatar_url}')` }}
                                />
                            ) : (
                                <div
                                    className={`w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold border-2 ${member.role === 'admin' || member.role === 'owner'
                                            ? 'border-[#13ec5b]'
                                            : 'border-gray-200 dark:border-[#2a4031]'
                                        }`}
                                >
                                    {member.profile?.full_name?.charAt(0).toUpperCase() || "?"}
                                </div>
                            )}
                            {(member.role === 'admin' || member.role === 'owner') && (
                                <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-[#1c2e22]">
                                    ADM
                                </div>
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
                        <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">
                            Outros
                        </span>
                    </div>
                )}

                {members.length === 0 && (
                    <div className="col-span-4 flex flex-col items-center justify-center py-6 text-center">
                        <div className="bg-gray-100 dark:bg-[#102216] p-3 rounded-full mb-3">
                            <span className="material-symbols-outlined text-gray-400 text-2xl">person_off</span>
                        </div>
                        <h4 className="font-bold text-sm text-[#0d1b12] dark:text-white mb-1">
                            Cadê a galera?
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-[200px]">
                            O time tá vazio. Convide os jogadores para começar.
                        </p>
                        <button
                            onClick={onInvite}
                            className="text-xs font-bold text-[#0d1b12] bg-[#13ec5b] hover:bg-[#0fd650] px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">share</span>
                            Chamar Jogadores
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
