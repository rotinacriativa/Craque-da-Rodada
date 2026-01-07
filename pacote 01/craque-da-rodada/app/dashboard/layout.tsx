"use client";

import Link from "next/link";
import { Lexend } from "next/font/google";
import { usePathname } from "next/navigation";

const lexend = Lexend({ subsets: ["latin"] });

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${lexend.className} bg-[#f6f8f6] dark:bg-[#102216] font-sans text-[#0d1b12] dark:text-white h-screen overflow-hidden flex selection:bg-[#13ec5b] selection:text-[#0d1b12]`}>
            {/* Material Symbols Font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white dark:bg-[#1a2c20] border-r border-[#e7f3eb] dark:border-[#2a4535] flex flex-col h-full shrink-0 z-30 hidden md:flex">
                {/* Brand Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 bg-[#13ec5b] rounded-xl flex items-center justify-center text-[#0d1b12] shadow-lg shadow-[#13ec5b]/20">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[#0d1b12] dark:text-white text-lg font-bold leading-none tracking-tight">PelaFacil</h1>
                        <p className="text-[#4c9a66] text-xs font-medium leading-normal mt-1">Organizador de Peladas</p>
                    </div>
                </div>
                {/* Navigation Links */}
                <nav className="flex-1 px-4 flex flex-col gap-2 mt-2">
                    {/* Active Link */}
                    <Link className="flex items-center gap-3 px-4 py-3 bg-[#13ec5b] text-[#0d1b12] rounded-full font-bold shadow-md shadow-[#13ec5b]/20 transition-all hover:scale-[1.02]" href="/dashboard">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    {/* Disabled Link */}
                    <div className="group relative flex items-center gap-3 px-4 py-3 text-[#5e7a68] dark:text-[#8baaa0] rounded-full font-medium hover:bg-[#e7f3eb] dark:hover:bg-[#2a4535] cursor-not-allowed opacity-70 transition-colors">
                        <span className="material-symbols-outlined">groups</span>
                        <span>Grupos</span>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#e7f3eb] dark:bg-[#2a4535] px-2 py-0.5 rounded-full text-[#4c9a66] dark:text-[#6cc589] border border-[#cfe7d7] dark:border-[#3e614d]">
                            EM BREVE
                        </span>
                    </div>
                    {/* Normal Link */}
                    <Link className="flex items-center gap-3 px-4 py-3 text-[#0d1b12] dark:text-white hover:bg-[#e7f3eb] dark:hover:bg-[#2a4535] rounded-full font-medium transition-colors" href="#">
                        <span className="material-symbols-outlined">person</span>
                        <span>Perfil</span>
                    </Link>
                    {/* Normal Link */}
                    <Link className="flex items-center gap-3 px-4 py-3 text-[#0d1b12] dark:text-white hover:bg-[#e7f3eb] dark:hover:bg-[#2a4535] rounded-full font-medium transition-colors" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span>Configurações</span>
                    </Link>
                    {/* Logout Link */}
                    <Link className="flex items-center gap-3 px-4 py-3 text-[#0d1b12] dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 dark:hover:text-red-400 rounded-full font-medium transition-colors mt-auto mb-2" href="/login">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Sair</span>
                    </Link>
                </nav>
                {/* Sidebar CTA */}
                <div className="p-6 border-t border-[#e7f3eb] dark:border-[#2a4535]">
                    <button className="w-full group flex items-center justify-center gap-2 bg-[#0d1b12] dark:bg-white text-white dark:text-[#0d1b12] py-3.5 rounded-full font-bold hover:opacity-90 hover:shadow-lg transition-all">
                        <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
                        <span className="truncate">Criar Nova Pelada</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Top Navigation Bar */}
                <header className="h-20 bg-white/80 dark:bg-[#1a2c20]/80 backdrop-blur-md border-b border-[#e7f3eb] dark:border-[#2a4535] flex items-center justify-between px-6 md:px-10 sticky top-0 z-20">
                    {/* Mobile Menu Trigger (Visible only on mobile) */}
                    <button className="md:hidden p-2 -ml-2 text-[#0d1b12] dark:text-white">
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
                            <span className="absolute top-2.5 right-3 size-2 bg-red-500 rounded-full border border-white dark:border-[#102216]"></span>
                        </button>
                        <div className="h-8 w-px bg-[#e7f3eb] dark:bg-[#2a4535] hidden md:block"></div>
                        {/* User Dropdown Trigger */}
                        <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-[#e7f3eb] dark:hover:bg-[#2a4535] transition-colors group">
                            <div
                                className="size-9 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-[#2a4535] shadow-sm group-hover:border-[#13ec5b] transition-colors"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuZFS0cdJVjd2O2QX3l-WKslCyg827o55O8tD7S51w1NBkdT2aWW3e6sEo1K9X8VxAF71QMy3asWwzzNBusngT2j5ucAA-jJWIDI9bSPLnSHcjHaduvlmB1Y7l_eVrGgNgBdBeHDHFwqdEybdt5YQ5KLede-gqnUXMdmvFVwuD-BT2pS-dcUWqMqwRX0IqZO5b0DCr13s2q7gMmmFLqQmxJ3KHX2KQ7iwS4vVutTm-n5-o6kd5CU3_7FFQen9qR-oi-Ui8CjLH57U')" }}
                            ></div>
                            <span className="hidden md:block text-sm font-bold text-[#0d1b12] dark:text-white">Ricardo S.</span>
                            <span className="hidden md:block material-symbols-outlined text-[#4c9a66]">expand_more</span>
                        </button>
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
