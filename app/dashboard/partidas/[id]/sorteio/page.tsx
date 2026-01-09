"use client";

import { useState, use } from "react";
import Link from "next/link";
import { supabase } from "../../../../../src/lib/client";

// Mock Data based on HTML
const MOCK_PLAYERS = [
    { id: '1', name: 'Rafael Barbosa', position: 'Goleiro', stars: 5.0, initial: 'RB', color: 'indigo', role_color: 'amber' },
    { id: '2', name: 'Lucas Mendes', position: 'Meia', stars: 4.5, initial: 'LM', color: 'emerald', role_color: 'emerald' },
    { id: '3', name: 'João Paulo', position: 'Ataque', stars: 3.8, initial: 'JP', color: 'purple', role_color: 'purple' },
    { id: '4', name: 'Marcos V.', position: 'Goleiro', stars: 4.2, initial: 'MV', color: 'orange', role_color: 'amber' },
    { id: '5', name: 'Thiago Rocha', position: 'Defesa', stars: 4.7, initial: 'TR', color: 'slate', role_color: 'slate' },
    { id: '6', name: 'Daniel Souza', position: 'Zagueiro', stars: 3.9, initial: 'DS', color: 'blue', role_color: 'blue' },
    { id: '7', name: 'Bruno Ramos', position: 'Volante', stars: 4.3, initial: 'BR', color: 'pink', role_color: 'pink' },
    { id: '8', name: 'Carlos Lima', position: 'Ataque', stars: 3.0, initial: 'CL', color: 'gray', role_color: 'slate' },
];

export default function TeamDrawPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: matchId } = use(params);

    // Config State
    const [numTeams, setNumTeams] = useState(4);
    const [playersPerTeam, setPlayersPerTeam] = useState(6); // This could be calculated
    const [criteria, setCriteria] = useState('balanced');

    // Players State
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>(MOCK_PLAYERS.map(p => p.id));
    const [searchTerm, setSearchTerm] = useState("");

    // Layout Helpers
    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(p => p !== id));
        } else {
            setSelectedPlayers(prev => [...prev, id]);
        }
    };

    const toggleAll = () => {
        if (selectedPlayers.length === MOCK_PLAYERS.length) {
            setSelectedPlayers([]);
        } else {
            setSelectedPlayers(MOCK_PLAYERS.map(p => p.id));
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 bg-[#f6f8f6] dark:bg-[#102216] transition-colors duration-200">
            {/* Header */}
            <header className="w-full px-6 py-5 md:px-10 md:py-8">
                <div className="max-w-7xl mx-auto w-full">
                    <nav className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                        <Link href="/dashboard" className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium">Dashboard</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link href="/dashboard/partidas" className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium">Partidas</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link href={`/dashboard/partidas/${matchId}`} className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium">Detalhes</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <span className="text-[#0d1b12] dark:text-white font-medium bg-white dark:bg-[#1a2c22] px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">Sorteio de Times</span>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 px-6 pb-12 md:px-10">
                <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">

                    {/* Page Title & Actions */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1b12] dark:text-white">Sorteio de Times</h2>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-lg">
                                <span className="material-symbols-outlined icon-filled text-[#13ec5b]">calendar_today</span>
                                <p className="font-medium">Pelada de Terça - 24/10</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">refresh</span>
                                Resetar
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                                Compartilhar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Main Column (2/3) - Config & Results */}
                        <div className="xl:col-span-2 flex flex-col gap-8">

                            {/* Configuration Card */}
                            <section className="bg-white dark:bg-[#1a2c22] p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b]">
                                        <span className="material-symbols-outlined icon-filled">tune</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Configurações do Sorteio</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Num Teams */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Número de Times</label>
                                        <div className="relative">
                                            <button
                                                onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
                                                className="absolute left-1 top-1 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#13ec5b] bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <input
                                                className="w-full text-center font-bold text-xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-[#0d1b12] dark:text-white focus:ring-0"
                                                readOnly type="text" value={numTeams}
                                            />
                                            <button
                                                onClick={() => setNumTeams(numTeams + 1)}
                                                className="absolute right-1 top-1 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#13ec5b] bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Players per Team */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jogadores por Time</label>
                                        <div className="relative">
                                            <input
                                                className="w-full text-center font-bold text-xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-[#0d1b12] dark:text-white focus:ring-0"
                                                readOnly type="text" value={playersPerTeam}
                                            />
                                            <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">AUTO</span>
                                        </div>
                                    </div>

                                    {/* Criteria */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Critério de Sorteio</label>
                                        <div className="relative">
                                            <select
                                                value={criteria}
                                                onChange={(e) => setCriteria(e.target.value)}
                                                className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-[#0d1b12] dark:text-white font-medium px-4 appearance-none focus:ring-2 focus:ring-[#13ec5b] cursor-pointer"
                                            >
                                                <option value="balanced">Equilibrado (Nível)</option>
                                                <option value="position">Por Posição</option>
                                                <option value="random">Totalmente Aleatório</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-3 text-slate-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Draw Button */}
                            <button className="w-full bg-[#13ec5b] hover:bg-[#0fd652] active:scale-[0.99] text-[#0d1b12] text-lg font-black py-5 rounded-2xl shadow-lg shadow-[#13ec5b]/25 transition-all flex items-center justify-center gap-3 group">
                                <span className="material-symbols-outlined text-[28px] group-hover:rotate-180 transition-transform duration-500">casino</span>
                                REALIZAR SORTEIO
                            </button>

                            {/* Teams Display (Mock) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Time 1 */}
                                <div className="bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">T1</div>
                                            <h4 className="font-bold text-[#0d1b12] dark:text-white">Time Vermelho</h4>
                                        </div>
                                        <span className="bg-white dark:bg-[#1a2c22] text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Média: 4.2</span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2">
                                        {MOCK_PLAYERS.slice(0, 5).map(player => (
                                            <div key={player.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                                <div className={`w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold`}>{player.initial}</div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{player.name}</span>
                                                {player.position === 'Goleiro' ? (
                                                    <span className="text-xs font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">GOL</span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{player.stars}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Time 2 */}
                                <div className="bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">T2</div>
                                            <h4 className="font-bold text-[#0d1b12] dark:text-white">Time Azul</h4>
                                        </div>
                                        <span className="bg-white dark:bg-[#1a2c22] text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Média: 4.1</span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2">
                                        {MOCK_PLAYERS.slice(5).map(player => (
                                            <div key={player.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                                <div className={`w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold`}>{player.initial}</div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{player.name}</span>
                                                {player.position === 'Goleiro' ? (
                                                    <span className="text-xs font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">GOL</span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{player.stars}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column (1/3) - Players List */}
                        <div className="xl:col-span-1">
                            <div className="bg-white dark:bg-[#1a2c22] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden max-h-[800px]">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-[#0d1b12] dark:text-white text-lg">Jogadores Confirmados</h3>
                                        <span className="bg-[#13ec5b]/20 text-[#0fd652] text-xs font-black px-2 py-1 rounded-full">{selectedPlayers.length}</span>
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a2c22] border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#13ec5b]/50 text-slate-700 dark:text-slate-300"
                                            placeholder="Buscar jogador..."
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <input
                                            id="selectAll"
                                            type="checkbox"
                                            checked={selectedPlayers.length === MOCK_PLAYERS.length && MOCK_PLAYERS.length > 0}
                                            onChange={toggleAll}
                                            className="rounded border-slate-300 dark:border-slate-600 text-[#13ec5b] focus:ring-[#13ec5b] h-4 w-4 cursor-pointer"
                                        />
                                        <label className="text-xs font-bold text-slate-500 cursor-pointer select-none" htmlFor="selectAll">Selecionar todos</label>
                                    </div>
                                </div>

                                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                                    {MOCK_PLAYERS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => (
                                        <label key={player.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                                            <input
                                                type="checkbox"
                                                checked={selectedPlayers.includes(player.id)}
                                                onChange={() => togglePlayer(player.id)}
                                                className="rounded border-slate-300 dark:border-slate-600 text-[#13ec5b] focus:ring-[#13ec5b] h-5 w-5 cursor-pointer"
                                            />
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {/* Logic for colored avatar loosely matching mock since we don't have bg-indigo-100 logic safely without safelist, using gray/primary for safety or style attributes */}
                                                <div className={`w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs`}>
                                                    {player.initial}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-[#0d1b12] dark:group-hover:text-white transition-colors font-medium">
                                                        {player.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded uppercase min-w-[40px] text-center">
                                                            {player.position}
                                                        </span>
                                                        <div className="flex text-[10px] text-slate-400 items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-[12px] text-amber-400 icon-filled">star</span>
                                                            {player.stars}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                                    <button className="text-[#13ec5b] hover:text-[#0fd652] text-sm font-bold">Ver lista de espera</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
