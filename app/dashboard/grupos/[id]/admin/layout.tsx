"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminProvider, useAdmin } from "./AdminContext";

export default function GroupAdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
        <AdminProvider groupId={id}>
            <AdminShell>{children}</AdminShell>
        </AdminProvider>
    );
}

function AdminShell({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthorized, groupId } = useAdmin();
    const pathname = usePathname();
    const isActive = (path: string) => pathname?.includes(path);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f6f8f6] dark:bg-[#102216]">
                <div className="flex flex-col items-center gap-4">
                    <span className="size-10 block rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-[#13ec5b] animate-spin"></span>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f6] dark:bg-[#102216]">
            {/* Sidebar */}
            <aside className="w-72 hidden lg:flex flex-col bg-white dark:bg-[#1a2c20] border-r border-[#e7f3eb] dark:border-[#2a4032] h-full flex-shrink-0 z-20 transition-colors duration-200">
                <div className="p-6 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-8">
                        {/* Header / Brand */}
                        <div className="flex items-center gap-3">
                            <div className="relative bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border-2 border-[#13ec5b] shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCb7D-ic_AMDndI-o1G-s7ZBSWb7DGlJPVkwB7e9hYIEbumvgQ6w1XOk0nvuRpKY976894Hd2WEyWmoqmgGg_TUBy6u42JmJ1Nfwn8tFjHpB_tkpd-aKFVGzSKPWKLCSGzxzJTR46eS5roVKmZAv7eu1cUeXr4bB8Hjvct31hpq622hMaOEviwYby4-q1eCAZyGDgSGflg2UChXsRFShOAaJEERxcE6NTjXDdszib0RuvJpB3im1sYBd5zBmpgrkW_1buc7Cxw4Kys')" }}>
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#13ec5b] border-2 border-white dark:border-[#1a2c20]"></span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[#0d1b12] dark:text-white text-lg font-bold leading-tight">Craque da Rodada</h1>
                                <p className="text-[#13ec5b] text-sm font-medium">Admin</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-2">
                            <Link
                                href={`/dashboard/grupos/${groupId}/admin`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname === `/dashboard/grupos/${groupId}/admin`
                                    ? "bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 text-[#0d1b12] dark:text-white shadow-sm ring-1 ring-[#13ec5b]/20"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-[#0d1b12] dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${pathname === `/dashboard/grupos/${groupId}/admin` ? "text-[#13ec5b] icon-filled" : "group-hover:text-[#13ec5b] transition-colors"}`}>dashboard</span>
                                <span className="font-medium">Dashboard</span>
                            </Link>

                            <Link
                                href={`/dashboard/grupos/${groupId}/admin/partidas`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/partidas')
                                    ? "bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 text-[#0d1b12] dark:text-white shadow-sm ring-1 ring-[#13ec5b]/20"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-[#0d1b12] dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/partidas') ? "text-[#13ec5b] icon-filled" : "group-hover:text-[#13ec5b] transition-colors"}`}>emoji_events</span>
                                <span className="font-medium">Partidas</span>
                            </Link>

                            <Link
                                href={`/dashboard/grupos/${groupId}/admin/jogadores`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/jogadores')
                                    ? "bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 text-[#0d1b12] dark:text-white shadow-sm ring-1 ring-[#13ec5b]/20"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-[#0d1b12] dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/jogadores') ? "text-[#13ec5b] icon-filled" : "group-hover:text-[#13ec5b] transition-colors"}`}>groups</span>
                                <span className="font-medium">Jogadores</span>
                            </Link>

                            <Link
                                href={`/dashboard/grupos/${groupId}/admin/financeiro`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/financeiro')
                                    ? "bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 text-[#0d1b12] dark:text-white shadow-sm ring-1 ring-[#13ec5b]/20"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-[#0d1b12] dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/financeiro') ? "text-[#13ec5b] icon-filled" : "group-hover:text-[#13ec5b] transition-colors"}`}>account_balance_wallet</span>
                                <span className="font-medium">Financeiro</span>
                            </Link>

                            <Link
                                href={`/dashboard/grupos/${groupId}/admin/configuracoes`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/configuracoes')
                                    ? "bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 text-[#0d1b12] dark:text-white shadow-sm ring-1 ring-[#13ec5b]/20"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-[#0d1b12] dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive('/configuracoes') ? "text-[#13ec5b] icon-filled" : "group-hover:text-[#13ec5b] transition-colors"}`}>settings</span>
                                <span className="font-medium">Configurações</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="mt-auto pt-6 border-t border-[#e7f3eb] dark:border-[#2a4032]">
                        <Link href={`/dashboard/grupos/${groupId}`} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            <span>Voltar para o Grupo</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
