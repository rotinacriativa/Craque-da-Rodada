"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import Link from "next/link";

export default function ExplorePage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Simple heuristic to detect invite code
    const isInviteCode = /^[A-Z0-9-]{6,}$/.test(searchTerm.trim().toUpperCase());

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('matches')
                .select('*, group:groups(name, image_url), match_participants(count)')
                .gte('date', today)
                .order('date', { ascending: true })
                .order('start_time', { ascending: true })
                .limit(20);

            if (error) throw error;
            setMatches(data || []);
        } catch (error) {
            console.error("Error fetching matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchOrJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;

        if (isInviteCode) {
            handleJoinPrivateGroup(term);
        } else {
            console.log("Searching for:", term);
            // Implement search filter logic here if needed
            // For now, we can filter the local 'matches' state or re-fetch
        }
    };

    const handleJoinPrivateGroup = async (code: string) => {
        setIsJoining(true);
        // Mocking the join logic for now (waiting for backend function)
        setTimeout(() => {
            alert(`Simulação: Entrando no grupo com código ${code}`);
            setIsJoining(false);
        }, 1500);
    };

    // Helper to format date
    const formatDate = (dateStr: string, timeStr: string) => {
        const date = new Date(`${dateStr}T${timeStr}`);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const time = timeStr.slice(0, 5);

        if (isToday) return `Hoje, ${time}`;
        if (isTomorrow) return `Amanhã, ${time}`;

        return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${time}`;
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
                    {/* Add more filters if needed */}
                </div>
            </div>

            {/* Content Grid: Featured & Nearby */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">

                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 dark:bg-[#1a2c20] h-[350px] rounded-[2rem]"></div>
                    ))
                ) : matches.length > 0 ? (
                    matches.map((match) => (
                        <Link
                            href={`/dashboard/partidas/${match.id}`}
                            key={match.id}
                            className="group relative flex flex-col bg-white dark:bg-[#1a2c20] rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-[#13ec5b]/10 transition-all duration-300 border border-transparent dark:border-[#2a4535] hover:border-[#13ec5b]/20 dark:hover:border-[#13ec5b]/20 cursor-pointer"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-200 dark:bg-[#102216]">
                                <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${match.group?.image_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"}')` }}></div>
                                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-[#0d1b12] dark:text-white shadow-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-[#13ec5b]">schedule</span>
                                    {formatDate(match.date, match.start_time)}
                                </div>
                                {match.price > 0 && (
                                    <div className="absolute top-3 right-3 bg-[#13ec5b] text-[#0d1b12] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        R$ {Number(match.price).toFixed(2).replace('.', ',')}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 p-2 pt-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white leading-tight group-hover:text-[#13ec5b] transition-colors line-clamp-1">{match.name}</h3>
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            <span className="text-sm truncate max-w-[200px]">{match.location || "Sem local"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13ec5b] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#13ec5b]"></span>
                                        </span>
                                        <span className="text-xs font-bold text-[#13ec5b]">
                                            {match.match_participants?.[0]?.count || 0}/{match.capacity || 20} confirmados
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-bold">
                                        {match.group?.name || "Grupo"}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center text-gray-500">
                        Nenhuma pelada pública encontrada para os próximos dias.
                    </div>
                )}

                {/* Card Create (Always visible at end) */}
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
                        Criar Pelada
                    </button>
                </article>
            </div>

            <div className="h-4"></div>
        </div>
    );
}

