"use client";

import { useState } from "react";
import Link from "next/link";

export default function JoinGroup() {
    const [inviteCode, setInviteCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleJoinGroup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Implement join logic with Supabase
        console.log("Joining group with code:", inviteCode);

        setTimeout(() => {
            setIsLoading(false);
            alert("Funcionalidade de entrar no grupo será implementada em breve com o backend!");
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center relative min-h-[calc(100vh-80px)]">
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 opacity-10 dark:opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[200px] text-[#13ec5b]">sports_soccer</span>
            </div>
            <div className="absolute bottom-10 left-10 opacity-10 dark:opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[150px] text-[#13ec5b]">stadium</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-[560px] flex flex-col relative z-10">
                {/* Back Link */}
                <Link className="inline-flex items-center gap-1 text-[#4c9a66] hover:text-[#13ec5b] mb-8 transition-colors self-start text-sm font-medium" href="/dashboard">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Voltar para Meus Grupos
                </Link>

                {/* Heading Section */}
                <div className="flex flex-col gap-4 mb-10">
                    <div className="size-16 rounded-2xl bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b] mb-2">
                        <span className="material-symbols-outlined text-4xl">mail</span>
                    </div>
                    <h1 className="text-[#0d1b12] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                        Entrar em um grupo
                    </h1>
                    <p className="text-[#4c9a66] dark:text-[#8baaa0] text-lg font-normal leading-relaxed max-w-md">
                        Use o código que o administrador te enviou para começar a jogar com a galera.
                    </p>
                </div>

                {/* Interaction Form */}
                <div className="bg-white dark:bg-[#183020] rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-[#e7f3eb] dark:border-[#1f3b29]">
                    <form onSubmit={handleJoinGroup} className="flex flex-col gap-6">
                        {/* Input Field */}
                        <label className="flex flex-col gap-2 w-full">
                            <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Código do convite ou link</span>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#4c9a66] group-focus-within:text-[#13ec5b] transition-colors">link</span>
                                </div>
                                <input
                                    className="w-full h-16 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8baaa0]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all text-lg font-medium"
                                    placeholder="Ex: CRAQUE-1234"
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                />
                            </div>
                        </label>

                        {/* Helper Text */}
                        <div className="flex items-start gap-2 px-4 -mt-2">
                            <span className="material-symbols-outlined text-[#4c9a66] text-sm mt-0.5">info</span>
                            <p className="text-[#4c9a66] dark:text-[#8baaa0] text-sm font-normal leading-normal">
                                Peça o link ou código diretamente ao organizador da pelada.
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !inviteCode}
                            className={`flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] text-lg font-bold leading-normal tracking-wide transition-all transform active:scale-[0.98] shadow-lg shadow-[#13ec5b]/25 mt-2 ${isLoading || !inviteCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="truncate">{isLoading ? 'Entrando...' : 'Entrar no grupo'}</span>
                            {!isLoading && <span className="material-symbols-outlined ml-2 text-xl font-bold">login</span>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
