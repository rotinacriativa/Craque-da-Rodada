import Link from "next/link";

export default function MatchHistoryPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#0d1b12] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Histórico de Partidas</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal max-w-xl">
                        Acompanhe seu desempenho, gols e relembre seus melhores momentos em campo.
                    </p>
                </div>
                <button className="bg-[#13ec5b] text-[#0d1b12] hover:bg-[#0fd650] transition-colors px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#13ec5b]/20">
                    <span className="material-symbols-outlined">add</span>
                    Registrar Partida Avulsa
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat Card 1 */}
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <span className="material-symbols-outlined text-[#13ec5b]">sports_soccer</span>
                        <span className="text-sm font-medium">Partidas Jogadas</span>
                    </div>
                    <p className="text-[#0d1b12] dark:text-white text-3xl font-bold tracking-tight">24</p>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-medium mt-1">+2 essa semana</div>
                </div>
                {/* Stat Card 2 */}
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <span className="material-symbols-outlined text-emerald-500">trophy</span>
                        <span className="text-sm font-medium">Vitórias</span>
                    </div>
                    <p className="text-[#0d1b12] dark:text-white text-3xl font-bold tracking-tight">14</p>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">58% de aproveitamento</div>
                </div>
                {/* Stat Card 3 */}
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <span className="material-symbols-outlined text-yellow-500">handshake</span>
                        <span className="text-sm font-medium">Empates</span>
                    </div>
                    <p className="text-[#0d1b12] dark:text-white text-3xl font-bold tracking-tight">4</p>
                </div>
                {/* Stat Card 4 */}
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <span className="material-symbols-outlined text-red-500">thumb_down</span>
                        <span className="text-sm font-medium">Derrotas</span>
                    </div>
                    <p className="text-[#0d1b12] dark:text-white text-3xl font-bold tracking-tight">6</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-1">
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 h-10 pl-4 pr-3 rounded-full bg-gray-100 dark:bg-[#2a4535] hover:bg-gray-200 dark:hover:bg-[#1f3b29] text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors">
                        Período: Últimos 30 dias
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </button>
                    <button className="flex items-center gap-2 h-10 pl-4 pr-3 rounded-full bg-gray-100 dark:bg-[#2a4535] hover:bg-gray-200 dark:hover:bg-[#1f3b29] text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors">
                        Grupo: Todos
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </button>
                    <button className="flex items-center gap-2 h-10 pl-4 pr-3 rounded-full bg-gray-100 dark:bg-[#2a4535] hover:bg-gray-200 dark:hover:bg-[#1f3b29] text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors">
                        Status: Todos
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </button>
                </div>
                <button className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#13ec5b] transition-colors">
                    Limpar filtros
                </button>
            </div>

            {/* Match Table */}
            <div className="w-full overflow-hidden rounded-3xl border border-[#e7f3eb] dark:border-[#2a4535] bg-white dark:bg-[#1a2c20] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e7f3eb] dark:border-[#2a4535] bg-gray-50 dark:bg-[#22382b]/50 text-left">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">Data & Hora</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-1/4">Local</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Grupo</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Placar</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7f3eb] dark:divide-[#2a4535]">
                            {/* Row 1 - Win */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-[#0d1b12] dark:text-white font-medium text-sm">12 Out, 2023</span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Quinta, 19:00</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-gray-100 dark:bg-[#2a4535] flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-gray-500 text-sm">location_on</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Arena Society Central</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                                            PT
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm">Pelada de Terça</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#2a4535] border border-gray-200 dark:border-[#2a4535] text-[#0d1b12] dark:text-white font-bold text-sm tracking-widest">
                                        7 - 5
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13ec5b]/20 text-emerald-800 dark:text-[#13ec5b] text-xs font-bold border border-[#13ec5b]/20">
                                        <span className="size-2 rounded-full bg-[#13ec5b]"></span>
                                        Vitória
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <button className="text-gray-400 hover:text-[#13ec5b] transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a4535]">
                                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                                    </button>
                                </td>
                            </tr>
                            {/* Row 2 - Draw */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-[#0d1b12] dark:text-white font-medium text-sm">05 Out, 2023</span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Quinta, 20:30</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-gray-100 dark:bg-[#2a4535] flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-gray-500 text-sm">location_on</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Clube Central</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-700 dark:text-orange-300">
                                            FA
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm">Futebol dos Amigos</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#2a4535] border border-gray-200 dark:border-[#2a4535] text-[#0d1b12] dark:text-white font-bold text-sm tracking-widest">
                                        4 - 4
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold border border-yellow-200 dark:border-yellow-800">
                                        <span className="size-2 rounded-full bg-yellow-500"></span>
                                        Empate
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <button className="text-gray-400 hover:text-[#13ec5b] transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a4535]">
                                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                                    </button>
                                </td>
                            </tr>
                            {/* Row 3 - Loss */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-[#0d1b12] dark:text-white font-medium text-sm">28 Set, 2023</span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Quinta, 19:00</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-gray-100 dark:bg-[#2a4535] flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-gray-500 text-sm">location_on</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Arena Society Central</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                                            PT
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-200 text-sm">Pelada de Terça</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#2a4535] border border-gray-200 dark:border-[#2a4535] text-[#0d1b12] dark:text-white font-bold text-sm tracking-widest">
                                        3 - 5
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-bold border border-red-200 dark:border-red-800">
                                        <span className="size-2 rounded-full bg-red-500"></span>
                                        Derrota
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <button className="text-gray-400 hover:text-[#13ec5b] transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a4535]">
                                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-[#e7f3eb] dark:border-[#2a4535] bg-gray-50 dark:bg-[#22382b]/50 px-6 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando <span className="font-bold text-[#0d1b12] dark:text-white">1</span> a <span className="font-bold text-[#0d1b12] dark:text-white">5</span> de <span className="font-bold text-[#0d1b12] dark:text-white">24</span> resultados
                    </p>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center rounded-lg border border-[#e7f3eb] dark:border-[#2a4535] bg-white dark:bg-transparent px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2a4535] disabled:opacity-50" disabled>
                            Anterior
                        </button>
                        <button className="flex items-center justify-center rounded-lg border border-[#e7f3eb] dark:border-[#2a4535] bg-white dark:bg-transparent px-3 py-1 text-sm font-medium text-[#0d1b12] hover:bg-gray-100 dark:text-white dark:hover:bg-[#2a4535]">
                            Próxima
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-4"></div>
        </div>
    );
}
