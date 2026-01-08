"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../src/lib/client";
import { formatDateForGroup } from "../../../../src/lib/utils";

export default function GroupDashboard({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const groupId = id;

    const [matches, setMatches] = useState<any[]>([]);
    const [group, setGroup] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Group Details
                const { data: groupData, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();

                if (groupError) {
                    if (groupError.code === 'PGRST116') {
                        setGroup(null);
                        // Stop loading if group not found, no need to fetch matches
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
                    .select('*')
                    .eq('group_id', groupId)
                    .gte('date', new Date().toISOString().split('T')[0]) // Only future or today's matches
                    .order('date', { ascending: true });

                if (matchesError) throw matchesError;
                setMatches(matchesData || []);

            } catch (error: any) {
                console.error("Error loading dashboard:", error);
                setError("Erro ao carregar dados do grupo. Tente recarregar a página.");
            } finally {
                setIsLoading(false);
            }
        }

        if (groupId) {
            fetchData();
        }
    }, [groupId]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px]">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
                <span className="mt-4 text-sm text-gray-500 font-medium">Carregando grupo...</span>
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
                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white mb-2">Grupo não encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">Não encontramos nenhum grupo com este link. Verifique o endereço ou peça um novo convite.</p>
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
                    <span className="text-gray-500 hover:text-[#13ec5b] transition-colors cursor-pointer">Meus Grupos</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-[#0d1b12] dark:text-white font-medium">{group.name}</span>
                </div>

                {/* Profile Header */}
                <div className="bg-white dark:bg-[#183020] rounded-xl p-6 md:p-8 shadow-sm border border-[#e7f3eb] dark:border-[#1f3b29] relative overflow-hidden">
                    {/* Decorative background accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#13ec5b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-[#2a4031] shadow-lg shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAWsYSD4QUg5Dl-clEdk83X_QgSxSVG2WM3lkat68NIljcbUgzR7QiKtjxf7IrPN4Eq8cyxdXgBBDkXPwk7TUO9yobssnmmpHaDRjy-iJNy8GieFaqF9w4jVQ8IHZp2w91KUGbPWHPtyG6yDl6q1ZEOyc55gfkZq6_y5BOGhmnoJsbBX0i29wJyfIyIseLT2r2cTFMwOoLpQXjBtuGSzPxjnLfaEIEswJNEkZqVkvIFlSae6e_G8XoeyBTjua-r32qNHn5FvWE-Mw')" }}></div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#0d1b12] dark:text-white tracking-tight">{group.name}</h1>
                                    <span className="px-3 py-1 bg-[#13ec5b]/20 text-[#0ea841] dark:text-[#13ec5b] text-xs font-bold uppercase rounded-full tracking-wide">Membro</span>
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
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-lg">share</span>
                                        <span>Convidar galera</span>
                                    </button>
                                    <Link
                                        href={`/dashboard/grupos/${groupId}/nova-partida`}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-colors shadow-lg shadow-black/10"
                                    >
                                        <span className="material-symbols-outlined text-lg">add_circle</span>
                                        <span>Criar Pelada</span>
                                    </Link>
                                    <Link
                                        href={`/dashboard/grupos/${groupId}/admin`}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors backdrop-blur-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">settings</span>
                                        <span>Gerenciar</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button className="group flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 font-semibold text-sm transition-all w-full md:w-auto">
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span>Sair do Grupo</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Layout Grid: Main Content & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 w-full max-w-6xl mx-auto">
                    {/* Left Column: Matches (Main Focus) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#0d1b12] dark:text-white">Próximas Partidas</h2>
                            <Link href="#" className="text-sm font-medium text-[#0ea841] dark:text-[#13ec5b] hover:underline">Ver histórico</Link>
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
                                                {/* Avatars placeholder (could be real players later) */}
                                                <div className="flex -space-x-2 mr-2 hidden md:flex">
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZkNk_S0MD3o3uEW2XxmPsOv4P3OtZ63IsBf5c4t4kWxV6WOvqLvA4OYaSZfbWpevORetRV5DCXSi6tzSIWyl3Oo7MPNN7AGPpSAynO06YM7GwKlYyuLwcTNKjSY9sNhWOyGsOwDc_rGO5CBVr2o-xkv8zRRKOiyx6ZY2uGIOgnkIFfTqrJ5SuSJHER2BOZLB_GFaC4e2-6KW4hyyKtWzKT_vNX9hX3anw1l9Psl0Ld_SqrwaCRJtDOUM11otOV0bTFQR4v1dRwgM')" }}></div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_AZgzBWXmaFYyM2aoCKyCYWKS5_aF5g8h8iaxLLh8dZUW2lx7TOSj9H3duRb3EM4n5QHu3uTi_Jn-8iYWE4GlcLwun4x1--r0tGscvH_bdAijTiF6KVUhk5uJTKeoqPAgxvQlkx6OrAzbj9AxYPA2TAT34YJnotKrnI_K-IV8UdD09aEWtFbsT4UHqABWbR08N8yVYkGqS8s0A-ygNfbQp66iNzOStNNpT-8FL5kSfoIMC42vxRI51NzMW9QB-vz4bCktL01z1Q4')" }}></div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBg4shSAgf0oozkpNWZclUL6osG8EH-dWRjmOMhLKd313WpTToJMSdrn7jg3SQHCnKU9dZmfCpbIc3CKGAtNTDwf4latSz19LB5mJeHt2uLiZjHzTTQStC852tax4ilAPqVsXWfM7W_hCg4O5KnKfcan6IbKnuDkYba6nHHK5-QkAgof2_h7hl5V1gxRtrTsU-594qJ5gqjiWWxFEyAvg2dQsRy0xPjywmyPtx3IrQaqoMepsbLFy9tHafTgt8H6gj5TWGbPT0IDqA')" }}></div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">+?</div>
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
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white mb-2">Nenhuma partida agendada</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">Organize o próximo jogo da sua turma agora mesmo.</p>
                                <Link
                                    href={`/dashboard/grupos/${groupId}/nova-partida`}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-all shadow-lg hover:shadow-[#13ec5b]/20"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Criar primeira Pelada
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
                                Sobre o Grupo
                            </h3>
                            <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                                <p className="mb-3 text-sm leading-relaxed">
                                    Grupo focado em diversão e respeito. Jogamos toda terça-feira religiosamente. Nível intermediário.
                                </p>
                                <div className="bg-[#f6f8f6] dark:bg-[#102216] p-3 rounded-lg border border-[#e7f3eb] dark:border-[#1f3b29]">
                                    <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Regras Rápidas</h4>
                                    <ul className="text-sm space-y-2 list-disc pl-4 marker:text-[#13ec5b]">
                                        <li>Chegar 15 min antes.</li>
                                        <li>Goleiro fixo não paga.</li>
                                        <li>Proibido carrinho.</li>
                                        <li>Pagamento via PIX antes do jogo.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Members Card */}
                        <div className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#e7f3eb] dark:border-[#1f3b29]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#13ec5b]">groups</span>
                                    Membros (24)
                                </h3>
                                <Link className="text-xs font-bold text-[#0ea841] dark:text-[#13ec5b] hover:underline" href="#">Ver todos</Link>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {/* Member 1 (Admin) */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-[#13ec5b]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCmSQWmb4e416gLjgykhvARrhgREwlQ6omR43G-cMHadkY0K2-mfRkUT8l38ZOSjV3n3x9kq3x2bInlgIPz0LC7m1xBSPLlPUwkfXmPsBDJ-6OW0PIetKztBFwGJgJd6fnhYcVbXt96js0ZBE_pxcR5qrYydgl_EYUeLE5S6-CWKCMcISkvkd6bfgvxfjTnhSzg9bNhpdoJPmMT8Mee6IrNQAwmxLZgf9zfV9dLs0OYSUPq3jdMEdZbt-XLt-cx6ozoieYc75LaxY')" }}></div>
                                        <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-[#1c2e22]">ADM</div>
                                    </div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Carlos</span>
                                </div>
                                {/* Member 2 */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDICiEYhQNpuov4FecrdRyv2qrfoHjJR871MB3aIOUdH1GPeUIon-eVQzP0ZKgDQBdudaD3-Td6t8yzSt__VPOJk_O5RgX3jEcG73r8IGoEquUJbaITV-mNR-XDUqrDYKQiCTf-bbfo9MGExZK6-TPNHp15djjxa2qwYxzzQGALqmzjj2SY1nyitonopiP1HwXWgi9LCxPx4_WmviGGYCv09dxmVarDMehkH1k6tebvWA2VFFV9MZJZQsThPcvRQ11sYzNL5gxXQYc')" }}></div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">João</span>
                                </div>
                                {/* Member 3 */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3vt9JQw3REUMc3ih_xWDe-F6VKiXrMCAGPIhj4e9ra_bDGcwiVf7OxA2h6_FXedMT77YDVGJJGTBRfD6Kf0WEG45K41ENoWNGa7MOqAa3YHxkXtpSoZ-QSPJB0BU5U5SSyZJ_13xwBC5uS3PrHNoOnVhJXFDJu_Xtd2kv0Tk7wTwRDnQ6LLZxeO12-_ZQXRXoc-Ik6ck8yUSqOubRqzWXKl_He7aZAu6aUTzyjUZ39NroZW0od4wgYhK81XigTzv__kekDBnJNu4')" }}></div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">André</span>
                                </div>
                                {/* Member 4 */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdPYToVNj6bBc1R_IFmLrWUU8X4qeXapx3NT5gyzkBcHOfBeK1v1I-8HDgnHqi_8DJwXiSuZtKGKEemyZ5aU0RZUvs7S4r39pntqK-ZNGY0FiUugPCLZslJ2ruE9WaFCU8K5w7rMUf53atN_NjIidTPASiLJ0belRTRiEx1zqeVTz_WeTKEj9e4VZHyX-089EywIUQFF_NJ92gUjFiNtE2R1hH58Iik0hOKtx76EN285J0HHu3MAyEWZzN979hZ_guwlQMMRqRKns')" }}></div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Felipe</span>
                                </div>
                                {/* Member 5 */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB__j1QcDQw3OTEf-sdMTgnozMsE5M3tDOW35RTHeSTu-P4hIYLSa38k8UJM0NRkmRoWQwBhG3GkDQciUPw0SUawabQIxOUnoAZS1L2hpavcyNE8tfrks-wTFmqXf9T4fWco24sw6nFVJVZ9Wd89mzQoxasS8GGEY9MLDVeYMpDj7-8W5cRQXuEq3fvxCkceDhDX8gliIKi6rzE2eRsgwRg_iF0pdhImUYIiBazqabTKsciLoj_v5o9odJ1Haw5vs6yaFgBLzvnJQk')" }}></div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Lucas</span>
                                </div>
                                {/* Member 6 */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1IjN0uvpfNqOsnTd5P26jUHpXlgNyI9G2h9hGfQsDr4Zf_LMa97d3Bh-kz6nJvLBzBbHbNtdcZQoC6J4ohuKVivJJfibhug2Ja-nlt5LZu9no6I8z80GcbPBDox4_TX9eeFy0UUP5INFnxcswpUChJVyVe7AMM__0pEBGP_DinSUAiyFXzzDjCbEoT1V7OvykYS9IsoS_LfudCRykmbWK6bf9YO8ML-cm4xSyXcnlBQIUuKIHIKejNnGb_F6TqLA0LXHo77WEfWU')" }}></div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Vitor</span>
                                </div>
                                {/* Member 7 */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCImLVXEyELkDjEYXi1pfh8wwJPVLlgMSqlIS1IXaZxEfTRPOx3QvbVkAVke6V9qu8bXDyvqQ28T3F6GFGzA2K52K-Fak9BkvyP0pYFfIMRhvqZ1DmJchySK_XxzZpUZXATwrUqtPwuth481Ob7UCSM-G9IDafVcgwX85aiECE1NW9wmAfg1r79Y77ryWDaP8jSlDkxmGH182gOfmYnIBV96nUL_F6GU8JTUdwGLVMf_tiujSX9LzzMjQG460wDQdCSGGe6hyjSL5o')" }}></div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Gui</span>
                                </div>
                                {/* More count */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#0ea841] dark:text-[#13ec5b] font-bold text-sm hover:bg-[#13ec5b]/20 transition-colors cursor-pointer">
                                        +17
                                    </div>
                                    <span className="text-xs font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">Outros</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
