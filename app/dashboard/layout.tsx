"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lexend } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import OnboardingModal from "../components/OnboardingModal";
import { supabase } from "../../src/lib/client";
import { cn } from "../../src/lib/utils";

const lexend = Lexend({ subsets: ["latin"] });

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [userName, setUserName] = useState("Carregando...");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try to get profile data first
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.full_name) {
                    setUserName(profile.full_name.split(' ')[0]); // Display first name
                    setUserAvatar(profile.avatar_url);
                } else if (user.user_metadata?.full_name) {
                    setUserName(user.user_metadata.full_name.split(' ')[0]);
                } else {
                    setUserName("Jogador");
                }
            }
        }
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Use router.push/replace instead of plain link
    };

    // Auto-close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // If we are in an Admin Panel route (e.g. /dashboard/grupos/123/admin/...),
    // we want to bypass this main Dashboard Sidebar so the Admin Layout can take full control.
    if (pathname?.includes("/admin")) {
        return (
            <div className={`${lexend.className} bg-[#f6f8f6] dark:bg-[#102216] font-sans text-[#0d1b12] dark:text-white h-screen overflow-hidden`}>
                <OnboardingModal />
                {/* Material Symbols Font */}
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
                {children}
            </div>
        );
    }

    const NavigationLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => {
        const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));

        const linkClass = (path: string) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-full transition-all",
            isActive(path)
                ? "bg-[#13ec5b] text-[#0d1b12] font-bold shadow-md shadow-[#13ec5b]/20 hover:scale-[1.02]"
                : "text-[#0d1b12] dark:text-white font-medium hover:bg-[#e7f3eb] dark:hover:bg-[#2a4535]"
        );

        const iconStyle = (path: string) => isActive(path) ? { fontVariationSettings: "'FILL' 1" } : {};

        return (
            <>
                <Link className={linkClass("/dashboard")} href="/dashboard" onClick={onLinkClick}>
                    <span className="material-symbols-outlined" style={iconStyle("/dashboard")}>dashboard</span>
                    <span>Dashboard</span>
                </Link>

                <Link className={linkClass("/dashboard/grupos")} href="/dashboard/grupos" onClick={onLinkClick}>
                    <span className="material-symbols-outlined" style={iconStyle("/dashboard/grupos")}>groups</span>
                    <span>Minhas Peladas</span>
                </Link>

                <Link className={linkClass("/dashboard/ranking")} href="/dashboard/ranking" onClick={onLinkClick}>
                    <span className="material-symbols-outlined" style={iconStyle("/dashboard/ranking")}>emoji_events</span>
                    <span>Ranking</span>
                </Link>

                <Link className={linkClass("/dashboard/explorar")} href="/dashboard/explorar" onClick={onLinkClick}>
                    <span className="material-symbols-outlined" style={iconStyle("/dashboard/explorar")}>explore</span>
                    <span>Explorar</span>
                </Link>

                <Link className={linkClass("/dashboard/perfil")} href="/dashboard/perfil" onClick={onLinkClick}>
                    <span className="material-symbols-outlined" style={iconStyle("/dashboard/perfil")}>person</span>
                    <span>Perfil</span>
                </Link>

                <Link className={linkClass("/dashboard/configuracoes")} href="/dashboard/configuracoes" onClick={onLinkClick}>
                    <span className="material-symbols-outlined" style={iconStyle("/dashboard/configuracoes")}>settings</span>
                    <span>Configurações</span>
                </Link>

                <button onClick={() => { handleSignOut(); onLinkClick?.(); }} className="flex items-center gap-3 px-4 py-3 text-[#0d1b12] dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 dark:hover:text-red-400 rounded-full font-medium transition-colors mt-auto mb-2 w-full text-left">
                    <span className="material-symbols-outlined">logout</span>
                    <span>Sair</span>
                </button>
            </>
        );
    };

    return (
        <div className={`${lexend.className} bg-[#f6f8f6] dark:bg-[#102216] font-sans text-[#0d1b12] dark:text-white h-screen overflow-hidden flex selection:bg-[#13ec5b] selection:text-[#0d1b12]`}>
            <OnboardingModal />
            {/* Material Symbols Font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

            {/* Desktop Sidebar */}
            <aside className="w-72 bg-white dark:bg-[#1a2c20] border-r border-[#e7f3eb] dark:border-[#2a4535] flex flex-col h-full shrink-0 z-30 hidden md:flex">
                {/* Brand Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 bg-[#13ec5b] rounded-xl flex items-center justify-center text-[#0d1b12] shadow-lg shadow-[#13ec5b]/20">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[#0d1b12] dark:text-white text-lg font-bold leading-none tracking-tight">Craque da Rodada</h1>
                        <p className="text-[#4c9a66] text-xs font-medium leading-normal mt-1">Organizador de Peladas</p>
                    </div>
                </div>
                {/* Navigation Links */}
                <nav className="flex-1 px-4 flex flex-col gap-2 mt-2">
                    <NavigationLinks />
                </nav>
                {/* Sidebar CTA */}
                <div className="p-6 border-t border-[#e7f3eb] dark:border-[#2a4535]">
                    <Link href="/dashboard/grupos" className="w-full group flex items-center justify-center gap-2 bg-[#0d1b12] dark:bg-white text-white dark:text-[#0d1b12] py-3.5 rounded-full font-bold hover:opacity-90 hover:shadow-lg transition-all">
                        <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
                        <span className="truncate">Criar Nova Pelada</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Drawer */}
                    <aside className="w-[80%] max-w-sm bg-white dark:bg-[#1a2c20] flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200 relative z-50">
                        <div className="p-6 flex items-center justify-between border-b border-[#e7f3eb] dark:border-[#2a4535]">
                            <div className="flex items-center gap-3">
                                <div className="size-8 bg-[#13ec5b] rounded-lg flex items-center justify-center text-[#0d1b12]">
                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                                </div>
                                <h1 className="text-[#0d1b12] dark:text-white text-base font-bold">Craque da Rodada</h1>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-[#0d1b12] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4 overflow-y-auto">
                            <NavigationLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
                        </nav>
                        <div className="p-4 border-t border-[#e7f3eb] dark:border-[#2a4535]">
                            <Link href="/dashboard/grupos" className="w-full group flex items-center justify-center gap-2 bg-[#0d1b12] dark:bg-white text-white dark:text-[#0d1b12] py-3.5 rounded-full font-bold hover:opacity-90 hover:shadow-lg transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                                <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
                                <span className="truncate">Criar Nova Pelada</span>
                            </Link>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Top Navigation Bar */}
                <header className="h-20 bg-white/80 dark:bg-[#1a2c20]/80 backdrop-blur-md border-b border-[#e7f3eb] dark:border-[#2a4535] flex items-center justify-between px-6 md:px-10 sticky top-0 z-20">
                    {/* Mobile Menu Trigger (Visible only on mobile) */}
                    <button
                        className="md:hidden p-2 -ml-2 text-[#0d1b12] dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Page Title */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[#4c9a66] text-sm font-medium mb-0.5">
                            <span className="hidden md:inline">Home</span>
                            <span className="hidden md:inline material-symbols-outlined text-xs">chevron_right</span>
                            <span>Dashboard</span>
                        </div>
                        <h2 className="text-[#0d1b12] dark:text-white text-xl font-bold leading-none tracking-tight">Visão Geral</h2>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Search (Desktop) */}
                        <div className="hidden md:flex items-center bg-[#f2f7f4] dark:bg-[#22382b] rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-[#13ec5b] transition-colors">
                            <span className="material-symbols-outlined text-[#4c9a66]">search</span>
                            <input className="bg-transparent border-none focus:ring-0 text-sm w-full text-[#0d1b12] dark:text-white placeholder-[#8baaa0]" placeholder="Buscar pelada ou jogador..." type="text" />
                        </div>
                        {/* Notifications */}
                        <button className="size-10 rounded-full bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] flex items-center justify-center text-[#0d1b12] dark:text-white hover:text-[#13ec5b] dark:hover:text-[#13ec5b] transition-colors relative shadow-sm">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                        </button>
                        <div className="h-8 w-px bg-[#e7f3eb] dark:bg-[#2a4535] hidden md:block"></div>
                        {/* User Dropdown Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-[#e7f3eb] dark:hover:bg-[#2a4535] transition-colors group"
                            >
                                <div
                                    className="size-9 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-[#2a4535] shadow-sm group-hover:border-[#13ec5b] transition-colors"
                                    style={{ backgroundImage: `url('${userAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuB3vt9JQw3REUMc3ih_xWDe-F6VKiXrMCAGPIhj4e9ra_bDGcwiVf7OxA2h6_FXedMT77YDVGJJGTBRfD6Kf0WEG45K41ENoWNGa7MOqAa3YHxkXtpSoZ-QSPJB0BU5U5SSyZJ_13xwBC5uS3PrHNoOnVhJXFDJu_Xtd2kv0Tk7wTwRDnQ6LLZxeO12-_ZQXRXoc-Ik6ck8yUSqOubRqzWXKl_He7aZAu6aUTzyjUZ39NroZW0od4wgYhK81XigTzv__kekDBnJNu4"}')` }}
                                ></div>
                                <span className="hidden md:block text-sm font-bold text-[#0d1b12] dark:text-white">{userName}</span>
                                <span className="hidden md:block material-symbols-outlined text-[#4c9a66] transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a2c20] rounded-xl shadow-lg border border-[#e7f3eb] dark:border-[#2a4535] py-2 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Link
                                        href="/dashboard/perfil"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="px-4 py-3 hover:bg-[#f6f8f6] dark:hover:bg-[#22382b] text-sm text-[#0d1b12] dark:text-white flex items-center gap-3 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                        Meu Perfil
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            handleSignOut();
                                        }}
                                        className="px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm text-red-500 dark:text-red-400 flex items-center gap-3 text-left w-full transition-colors border-t border-[#e7f3eb] dark:border-[#2a4535]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-20">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
