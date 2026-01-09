"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";

export default function ExplorePage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    // Simple heuristic to detect if it might be an invite code (mostly uppercase, no spaces, e.g. "CRAQUE123")
    const isInviteCode = /^[A-Z0-9-]{6,}$/.test(searchTerm.trim().toUpperCase());

    const handleSearchOrJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        const term = searchTerm.trim();
        if (!term) return;

        if (isInviteCode) {
            handleJoinPrivateGroup(term);
        } else {
            // Normal Search logic (client-side filter or refresh with query param)
            console.log("Searching for:", term);
            // In a real app, this would trigger a re-fetch or specific search query
        }
    };

    const handleJoinPrivateGroup = async (code: string) => {
        setIsJoining(true);
        // Mocking the join logic for now (waiting for backend function)
        setTimeout(() => {
            alert(`Simulação: Entrando no grupo com código ${code}`);
            setIsJoining(false);
            // router.push('/dashboard/grupos/SOME_ID');
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-[1280px] mx-auto">
            {/* Page Header & Smart Search */}
            <div className="flex flex-col items-center gap-6 w-full text-center py-8">
                <div className="space-y-3 max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0d1b12] dark:text-white">
                        Encontre sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13ec5b] to-green-600">próxima pelada</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">
                        Busque por nome, bairro ou cole um <span className="text-[#0d1b12] dark:text-white font-bold">código de convite</span> para entrar direto.
                    </p>
                </div>

                {/* Smart Search Bar */}
                <form onSubmit={handleSearchOrJoin} className="relative group w-full max-w-2xl transition-all">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className={`material-symbols-outlined text-[24px] transition-colors ${isInviteCode ? 'text-[#13ec5b]' : 'text-gray-400'}`}>
                            {isInviteCode ? 'vpn_key' : 'search'}
                        </span>
                    </div>
                    <input
                        className={`block w-full pl-14 pr-36 py-5 bg-white dark:bg-[#1a2c20] border-2 ${isInviteCode ? 'border-[#13ec5b] ring-4 ring-[#13ec5b]/10' : 'border-transparent focus:border-[#13ec5b]/50'} text-[#0d1b12] dark:text-white placeholder-gray-400 rounded-3xl shadow-lg focus:outline-none focus:ring-0 transition-all text-lg font-medium`}
                        placeholder="Nome da pelada ou código de convite..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-2 right-2 flex items-center">
                        <button
                            type="submit"
                            disabled={!searchTerm}
                            className={`h-full px-6 rounded-2xl font-bold transition-all flex items-center gap-2 ${isInviteCode ? 'bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] shadow-md shadow-[#13ec5b]/20' : 'bg-gray-100 dark:bg-[#2a4535] hover:bg-gray-200 dark:hover:bg-[#1f3b29] text-gray-600 dark:text-gray-300'}`}
                        >
                            {isJoining ? (
                                <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>{isInviteCode ? 'Entrar' : 'Buscar'}</span>
                                    {isInviteCode && <span className="material-symbols-outlined text-[20px]">login</span>}
                                </>
                            )}
                        </button>
                    </div>
                </form>
                {/* Visual Feedback for Code */}
                <div className={`h-6 text-sm font-bold text-[#13ec5b] transition-opacity duration-300 ${isInviteCode ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Código de convite detectado
                    </span>
                </div>
            </div>

            {/* Filters & Tabs Container */}
            <div className="flex flex-col gap-6 w-full mt-4">
                {/* Horizontal Chips */}
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar w-full">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#13ec5b] text-[#0d1b12] font-bold text-sm whitespace-nowrap shadow-lg shadow-[#13ec5b]/20 transition-transform active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">sports_soccer</span>
                        Todos
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap hover:border-[#13ec5b]/50 transition-colors">
                        Futebol Society
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap hover:border-[#13ec5b]/50 transition-colors">
                        Futsal
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap hover:border-[#13ec5b]/50 transition-colors">
                        Campo
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap hover:border-[#13ec5b]/50 transition-colors">
                        Hoje
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap hover:border-[#13ec5b]/50 transition-colors">
                        Nível: Amador
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                </div>
            </div>

            {/* Content Grid: Featured & Nearby */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {/* Card 1 */}
                <article className="group relative flex flex-col bg-white dark:bg-[#1a2c20] rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-[#13ec5b]/10 transition-all duration-300 border border-transparent dark:border-[#2a4535] hover:border-[#13ec5b]/20 dark:hover:border-[#13ec5b]/20 cursor-pointer">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-200 dark:bg-[#102216]">
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtQc_GmDDH5mHGDAUdEFzlYhlJim6AXODCHZFF9i1ePk4ge8V1p57HESmfqzrU71AVvF-beywM7GT9jZc0PrVgVr-gogMqwYkeOpgCKrI_K6ZwnqAtTc6ifyQ3U8UMwGCWeVthZzs1o5Gi9eStGe8dBKvfjqg8UPHQ4lEbukMH9tPTDmLEG2P_N9-xl8nudxpfPCTxN6laZlXyObrfIVnYWFPAygc5KTAUQ2PRKU-oupADC5o3_FyHuoER7CzcFSwuDhEAdGtuYuU')" }}></div>
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-[#0d1b12] dark:text-white shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-[#13ec5b]">schedule</span>
                            Hoje, 19:30
                        </div>
                        <div className="absolute top-3 right-3 bg-[#13ec5b] text-[#0d1b12] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            R$ 25,00
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 p-2 pt-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white leading-tight group-hover:text-[#13ec5b] transition-colors">Pelada dos Amigos</h3>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    <span className="text-sm">Arena XP, Barra Funda</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1w7jf3gdkeKtIpCzGSF4TOVqNfRQ2ZKdoXLdOboZoLyybSOVdToYCRqx6XJmcvc8ZWGfvnfqBht6m0k0r64vbwqoSHgA7mcorYHMCcR-jy0j7hLWLQQ2N1_jOfAvNvxwDFixRTT_Sa3C_tEWKBYN-rXvNN4EWsU0xbs3KYMShRZT5SDnLKbp7glwiV6-VWX38c4rAeHqfOlFcbV2wAYjBINOak4OUZLL01B-hvDCA-_--ayBn4gHzT6Ss0kV5gnMBQ4XQoSSgBH4')" }}></div>
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-300 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6Vzp_5RPALT9x2BGOIpXAPOL21H9aLEfe5xTS1XO-WE19m5iz6TgcmGKgJdFyma0rEfvFMWoNCLfudnufrOye2e4MlsSQRNChmXHYZhRCk2Fr4MHsoocL-Ozyk-NJhlbSI5_9WErSh2RenY24axqpVE8ik4hnYuLzZqAJKFvQCu6rokZgi8M22-jBZe0QgAch7pJDA8OXB9Haaw7CXm4WADyLCwF4-QMNvcwuYBvGtlqwszFHFxqTCTJAiCoqdc1F4pccYuRpoxY')" }}></div>
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                    +8
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13ec5b] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#13ec5b]"></span>
                                </span>
                                <span className="text-xs font-bold text-[#13ec5b]">3 vagas</span>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Card 2 */}
                <article className="group relative flex flex-col bg-white dark:bg-[#1a2c20] rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-[#13ec5b]/10 transition-all duration-300 border border-transparent dark:border-[#2a4535] hover:border-[#13ec5b]/20 dark:hover:border-[#13ec5b]/20 cursor-pointer">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-200 dark:bg-[#102216]">
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHIzlu6UkKUh9lDnCCa-TaIUDQiaYCzHrK_6cjtlSHkLFiOf6-E8oG4u4s_lpyYuLF14SS4IODtQb0FYTV-urmP46e76KAxboi9WDMRd1oB3wmSpd6ckdf_9GRPaQLQnf97KyAkjFGMObKTvh7NP8XNaypuZduidFwdYuw9NKN7XS9moSL_aM_ewrUyiVt3qwDOnxvg4UVmNoDBbAxrNBTng462v-Lw7aEdgn2Ymk7SAuF1M5P9FVF8YryzfAtyleiTINpPXpAoww')" }}></div>
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-[#0d1b12] dark:text-white shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-[#13ec5b]">calendar_today</span>
                            Amanhã, 20:00
                        </div>
                        <div className="absolute top-3 right-3 bg-[#13ec5b]/20 backdrop-blur-md text-[#0ea841] dark:text-[#13ec5b] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#13ec5b]/30">
                            Futsal
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 p-2 pt-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white leading-tight group-hover:text-[#13ec5b] transition-colors">Futsal de Quinta</h3>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    <span className="text-sm">Ginásio Poliesportivo</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAidPvj8K6GGXcTnFdfQ1weZfSUFF25bAFxw3r_LpMxHj5WVFbv3gvNnuXP18_whyKfoi6bUeXbztsuGo03nXdKm79JVsZmayTjAKUNM9f2g74KQ8jXMnjzOpvHc6p4QqbgY6JlS1CFRFruSgTbd3_qJSztfw9plXp05mBFDP7yMonwvoTCYQSVSfU65WXUH3KeVJRqzGKSRuflYkmk4e-ASP8ac-WN7TXdd14tKsS6gVwbTFVgCTUb22NDaF_NMbMBeR4ARylfc00')" }}></div>
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                    +4
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">6 vagas restantes</span>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Card 3 (Create) */}
                <article className="group relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-[#2a4535]/20 dark:to-[#1a2c20] rounded-[2rem] p-6 shadow-sm border border-dashed border-gray-300 dark:border-[#2a4535] hover:border-[#13ec5b] dark:hover:border-[#13ec5b] transition-all duration-300 min-h-[350px]">
                    <div className="w-16 h-16 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b] mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[32px]">add</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white text-center mb-2">Não encontrou?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Crie sua própria pelada e convide seus amigos para jogar.</p>
                    <button
                        onClick={() => router.push('/dashboard/criar-grupo')}
                        className="w-full bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#13ec5b]/20"
                    >
                        Criar Grupo
                    </button>
                </article>
            </div>

            <div className="h-4"></div>
        </div>
    );
}

