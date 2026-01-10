import Link from "next/link";

interface GroupHeaderProps {
    group: {
        name: string;
        description?: string;
        logo_url?: string;
        location?: string;
        created_at: string;
    };
    isAdmin: boolean;
    groupId: string;
    inviteCopied: boolean;
    onInvite: () => void;
}

export function GroupHeader({ group, isAdmin, groupId, inviteCopied, onInvite }: GroupHeaderProps) {
    return (
        <div className="bg-white dark:bg-[#183020] rounded-xl p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#1f3b29] relative overflow-hidden">
            {/* Decorative background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#13ec5b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-[#2a4031] shadow-lg shrink-0"
                        style={{ backgroundImage: `url('${group.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBAWsYSD4QUg5Dl-clEdk83X_QgSxSVG2WM3lkat68NIljcbUgzR7QiKtjxf7IrPN4Eq8cyxdXgBBDkXPwk7TUO9yobssnmmpHaDRjy-iJNy8GieFaqF9w4jVQ8IHZp2w91KUGbPWHPtyG6yDl6q1ZEOyc55gfkZq6_y5BOGhmnoJsbBX0i29wJyfIyIseLT2r2cTFMwOoLpQXjBtuGSzPxjnLfaEIEswJNEkZqVkvIFlSae6e_G8XoeyBTjua-r32qNHn5FvWE-Mw"}')` }}
                    />

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0d1b12] dark:text-white tracking-tight">
                                {group.name}
                            </h1>
                            {isAdmin ? (
                                <span className="px-3 py-1 bg-[#13ec5b] text-[#102216] text-xs font-bold uppercase rounded-full tracking-wide shadow-sm shadow-[#13ec5b]/20">
                                    Admin
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-[#13ec5b]/20 text-[#0ea841] dark:text-[#13ec5b] text-xs font-bold uppercase rounded-full tracking-wide">
                                    Membro
                                </span>
                            )}
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
                            {group.description || "Sem descrição."}
                        </p>

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
                                onClick={onInvite}
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

                            {/* Create Match - Always visible for player */}
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
                                    <span>Painel</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
