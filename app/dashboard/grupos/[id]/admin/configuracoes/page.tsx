"use client";

import { use } from "react";
import { useState } from "react";

export default function GroupSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;

    // Use state for form handling later, sticking to visual port for now
    const [groupName, setGroupName] = useState("Craque da Rodada FC");
    const [location, setLocation] = useState("Arena Society Central");
    const [description, setDescription] = useState("Grupo oficial para as peladas de terça-feira. Respeito e bom futebol acima de tudo!");

    return (
        <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 pb-12 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl md:text-3xl font-black tracking-tight text-[#0d1b12] dark:text-white">Configurações do Grupo</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Gerencie informações, regras e permissões.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Principal - Esquerda (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Dados do Grupo */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">badge</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Dados do Grupo</h3>
                        </div>
                        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative w-24 h-24 rounded-2xl bg-gray-100 dark:bg-[#25382e] border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#13ec5b] transition-colors">
                                        <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
                                        <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                                    </div>
                                    <button className="text-xs font-bold text-[#13ec5b] hover:text-[#0fd652]">Alterar Logo</button>
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome do Grupo</label>
                                            <input
                                                className="w-full rounded-xl border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 px-4 py-3 text-[#0d1b12] dark:text-white focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                                type="text"
                                                value={groupName}
                                                onChange={(e) => setGroupName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Local Padrão</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400 text-[20px]">location_on</span>
                                                <input
                                                    className="w-full rounded-xl border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 pl-10 pr-4 py-3 text-[#0d1b12] dark:text-white focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                                        <textarea
                                            className="w-full rounded-xl border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 px-4 py-3 text-[#0d1b12] dark:text-white focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                                            rows={2}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button className="bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#13ec5b]/20">
                                            Salvar Dados
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Administradores - Moved here for better flow or keep bottom? Keeping bottom might be better for hierarchy. Let's put Admins below Dados. */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032]">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Administradores</h3>
                            </div>
                            <button className="text-[#13ec5b] hover:text-[#0fd652] font-bold text-sm flex items-center gap-1 bg-[#13ec5b]/10 px-3 py-1.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">add</span> Novo Admin
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-100 dark:border-[#2a4032]">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#13ec5b]/20 flex items-center justify-center text-[#0d1b12] dark:text-white font-bold text-sm">PF</div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Craque da Rodada (Você)</p>
                                        <p className="text-xs text-emerald-500 font-medium">Proprietário</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded">Ativo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-100 dark:border-[#2a4032] group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm">JS</div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">João Silva</p>
                                        <p className="text-xs text-gray-500">Adicionado em 12 Out</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Remover admin">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#102216]/50 border border-gray-100 dark:border-[#2a4032] group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">CM</div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Carlos Mendes</p>
                                        <p className="text-xs text-gray-500">Adicionado em 05 Set</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Remover admin">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Lateral - Direita (1/3) */}
                <div className="flex flex-col gap-6">
                    {/* Regras da Pelada */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032] h-fit">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">rule</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Regras</h3>
                        </div>
                        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Duração</label>
                                    <div className="relative">
                                        <input className="w-full rounded-lg border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 px-3 py-2 text-[#0d1b12] dark:text-white text-sm focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none" type="number" defaultValue="60" />
                                        <span className="absolute right-3 top-2 text-gray-400 text-xs">min</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Jogadores</label>
                                    <div className="relative">
                                        <input className="w-full rounded-lg border-[#e7f3eb] dark:border-[#2a4032] bg-gray-50 dark:bg-[#102216]/50 px-3 py-2 text-[#0d1b12] dark:text-white text-sm focus:ring-2 focus:ring-[#13ec5b] focus:border-transparent outline-none" type="number" defaultValue="14" />
                                        <span className="absolute right-3 top-2 text-gray-400 text-xs">pax</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold uppercase text-gray-500">Tolerância</label>
                                    <span className="bg-gray-100 dark:bg-[#25382e] text-[#0d1b12] dark:text-white px-2 py-0.5 rounded text-[10px] font-bold">15 min</span>
                                </div>
                                <input className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#13ec5b]" max="60" min="0" type="range" defaultValue="15" />
                            </div>
                            <button className="w-full bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-[#13ec5b]/10 text-sm">
                                Salvar Regras
                            </button>
                        </form>
                    </div>

                    {/* Privacidade e Visibilidade */}
                    <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4032] h-fit">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e7f3eb] dark:border-[#2a4032]">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25382e] flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Privacidade</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="font-bold text-[#0d1b12] dark:text-white text-sm">Grupo Privado</p>
                                    <p className="text-xs text-gray-500">Apenas convidados.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                                    <input defaultChecked className="sr-only peer" type="checkbox" />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#13ec5b]"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="font-bold text-[#0d1b12] dark:text-white text-sm">Aprovação Manual</p>
                                    <p className="text-xs text-gray-500">Admin aprova membros.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                                    <input className="sr-only peer" type="checkbox" />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#13ec5b]"></div>
                                </label>
                            </div>
                            <button className="w-full bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-[#13ec5b]/10 text-sm mt-2">
                                Salvar Privacidade
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
