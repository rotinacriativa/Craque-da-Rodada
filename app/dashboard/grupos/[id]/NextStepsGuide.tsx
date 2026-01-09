"use client";

import Link from "next/link";
import { useState } from "react";

interface NextStepsGuideProps {
    isAdmin: boolean;
    membersCount: number;
    matchesCount: number;
    groupId: string;
    onInvite: () => void;
}

export default function NextStepsGuide({ isAdmin, membersCount, matchesCount, groupId, onInvite }: NextStepsGuideProps) {
    if (!isAdmin) return null;

    // Logic to determine step
    // Step 1: Created (Implied done)
    // Step 2: Add Players (If members <= 1, assuming 1 is the creator)
    // Step 3: Create Match (If members > 1 but matches == 0)
    // Step 4: Done/Maintenance (matches > 0)

    const isStepAddPlayers = membersCount <= 1;
    const isStepCreateMatch = membersCount > 1 && matchesCount === 0;

    if (!isStepAddPlayers && !isStepCreateMatch) return null;

    return (
        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#1a2c22] dark:to-[#122018] rounded-2xl p-6 relative overflow-hidden shadow-xl border border-slate-800 dark:border-[#2a4533]">

                {/* Background Decor */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#13ec5b]/10 to-transparent"></div>
                <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-[#13ec5b]/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Content */}
                    <div className="flex items-start gap-4 max-w-xl">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#13ec5b] text-[#0d1b12] font-black text-xl shadow-lg shadow-[#13ec5b]/20">
                            {isStepAddPlayers ? "2" : "3"}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                {isStepAddPlayers ? "Hora de convocar o time!" : "Bora marcar o primeiro jogo?"}
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {isStepAddPlayers
                                    ? "Sua pelada foi criada, mas tá vazia. Mande o link no grupo do WhatsApp para a galera entrar."
                                    : "A galera já tá dentro! Agora é só marcar a data e hora para a resenha começar."}
                            </p>

                            {/* Progress Indicators */}
                            <div className="flex items-center gap-2 mt-4">
                                <span className={`h-1.5 w-8 rounded-full ${isStepAddPlayers ? 'bg-[#13ec5b]' : 'bg-[#13ec5b]'}`}></span>
                                <span className={`h-1.5 w-8 rounded-full ${isStepAddPlayers ? 'bg-[#13ec5b] animate-pulse' : 'bg-[#13ec5b]'}`}></span>
                                <span className={`h-1.5 w-8 rounded-full ${isStepCreateMatch ? 'bg-[#13ec5b] animate-pulse' : 'bg-slate-600'}`}></span>
                                <span className="h-1.5 w-8 rounded-full bg-slate-700"></span>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 w-full md:w-auto">
                        {isStepAddPlayers ? (
                            <button
                                onClick={onInvite}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-[#13ec5b]/20"
                            >
                                <span className="material-symbols-outlined">share</span>
                                Convidar Jogadores
                            </button>
                        ) : (
                            <Link
                                href={`/dashboard/grupos/${groupId}/nova-partida`}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-transform hover:scale-105 shadow-lg shadow-[#13ec5b]/20"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Marcar Jogo
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
