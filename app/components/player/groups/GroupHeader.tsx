import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface GroupHeaderProps {
    group: {
        name: string;
        description?: string;
        logo_url?: string;
        location?: string;
        created_at: string;
        manual_approval?: boolean;
    };
    isAdmin: boolean;
    groupId: string;
    inviteCopied: boolean;
    onInvite: () => void;
    onLeave: () => void;
}

export function GroupHeader({ group, isAdmin, groupId, inviteCopied, onInvite, onLeave }: GroupHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-white dark:bg-[#183020] rounded-2xl p-5 shadow-sm border border-[#e7f3eb] dark:border-[#1f3b29] relative">
            {/* Header Top Row: Logo, Info, Menu */}
            <div className="flex items-start gap-4">
                {/* Logo */}
                <div
                    className="bg-center bg-no-repeat bg-cover rounded-2xl w-20 h-20 md:w-24 md:h-24 border-2 border-gray-100 dark:border-[#2a4031] shrink-0"
                    style={{ backgroundImage: `url('${group.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBAWsYSD4QUg5Dl-clEdk83X_QgSxSVG2WM3lkat68NIljcbUgzR7QiKtjxf7IrPN4Eq8cyxdXgBBDkXPwk7TUO9yobssnmmpHaDRjy-iJNy8GieFaqF9w4jVQ8IHZp2w91KUGbPWHPtyG6yDl6q1ZEOyc55gfkZq6_y5BOGhmnoJsbBX0i29wJyfIyIseLT2r2cTFMwOoLpQXjBtuGSzPxjnLfaEIEswJNEkZqVkvIFlSae6e_G8XoeyBTjua-r32qNHn5FvWE-Mw"}')` }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col pt-1 gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl md:text-2xl font-black text-[#0d1b12] dark:text-white leading-tight truncate">
                            {group.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        {isAdmin ? (
                            <span className="px-2 py-0.5 bg-[#13ec5b] text-[#0d1b12] text-[10px] font-black uppercase rounded dark:bg-[#13ec5b] dark:text-[#0d1b12]">
                                Admin
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded dark:bg-white/10 dark:text-gray-300">
                                Membro
                            </span>
                        )}
                        <span className="text-gray-400 text-[10px]">•</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[120px]">
                            {group.location || "Local indefinido"}
                        </span>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mt-1">
                        {group.description || "Sem descrição definida."}
                    </p>

                    {/* Desktop Actions Row */}
                    <div className="hidden md:flex items-center gap-3 mt-4">
                        <button
                            onClick={onInvite}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${inviteCopied
                                ? "bg-green-600 text-white shadow-lg scale-105"
                                : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a4031] dark:hover:bg-[#35503d] text-[#0d1b12] dark:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {inviteCopied ? "check_circle" : "share"}
                            </span>
                            <span>{inviteCopied ? "Link Copiado!" : "Convidar galera"}</span>
                        </button>

                        {isAdmin && (
                            <Link
                                href={`/dashboard/grupos/${groupId}/admin`}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0d1b12] hover:bg-[#1a2c20] dark:bg-white dark:hover:bg-gray-200 text-white dark:text-[#0d1b12] rounded-full font-bold text-sm transition-colors shadow-md"
                            >
                                <span className="material-symbols-outlined text-lg">settings</span>
                                <span>Painel</span>
                            </Link>
                        )}

                        <button
                            onClick={onLeave}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 rounded-full font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            <span>Sair</span>
                        </button>
                    </div>
                </div>

                {/* Three Dots Menu (Mobile Only) */}
                <div className="relative shrink-0 md:hidden" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white transition-colors rounded-full active:bg-gray-100 dark:active:bg-white/5"
                        title="Mais opções"
                    >
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#1a2e22] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a4533] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="py-1">
                                {isAdmin && (
                                    <Link
                                        href={`/dashboard/grupos/${groupId}/admin`}
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#0d1b12] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                    >
                                        <span className="material-symbols-outlined text-lg">settings</span>
                                        Gerenciar Grupo
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        onInvite();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#0d1b12] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    <span className="material-symbols-outlined text-lg">share</span>
                                    {inviteCopied ? "Link Copiado!" : "Convidar Amigos"}
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                                <button
                                    onClick={() => {
                                        onLeave();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Sair do Grupo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Primary Action Button (Single CTA) */}
            <div className="mt-5">
                {isAdmin ? (
                    <Link
                        href={`/dashboard/grupos/${groupId}/nova-partida`}
                        className="w-full h-12 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] flex items-center justify-center gap-2 rounded-xl font-black text-sm uppercase tracking-wide shadow-lg shadow-[#13ec5b]/20 transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        Criar Nova Partida
                    </Link>
                ) : (
                    <button
                        onClick={onInvite}
                        className="w-full h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#13ec5b] dark:hover:border-[#13ec5b] text-[#0d1b12] dark:text-white flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all active:scale-[0.98]" // Keep this for player on mobile AND desktop as requested by prompt "Apenas 1 CTA primário por tela" rule, but maybe desktop can have it in the row? 
                    // Actually, prompts says "Mobile-first" and "Apenas 1 CTA". 
                    // But user specifically asked to RESTORE desktop buttons.
                    // So I added the desktop row above.
                    // I will keep this big button here too as it's the PRIMARY action (Create Match / Invite).
                    // It effectively duplicates the invite button for members on desktop, but that's okay for emphasis.
                    >
                        <span className="material-symbols-outlined text-xl">share</span>
                        {inviteCopied ? "Copiado!" : "Convidar Galera"}
                    </button>
                )}
            </div>
        </div>
    );
}
