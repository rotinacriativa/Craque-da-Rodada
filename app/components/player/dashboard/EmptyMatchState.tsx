import Link from "next/link";

interface EmptyMatchStateProps {
    onCreateMatch?: () => void;
    hasGroups?: boolean;
}

export function EmptyMatchState({ onCreateMatch, hasGroups = false }: EmptyMatchStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-[2.5rem] bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#13ec5b]" />

            <div className="bg-[#13ec5b]/10 p-6 rounded-full mb-6">
                <span className="material-symbols-outlined text-4xl text-[#0ea841] dark:text-[#13ec5b]">
                    sports_soccer
                </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-[#0d1b12] dark:text-white mb-3 tracking-tight">
                Bora organizar o jogo?
            </h3>

            <p className="text-[#4c9a66] dark:text-[#8baaa0] mb-8 max-w-md text-lg leading-relaxed">
                {hasGroups
                    ? "Agende sua próxima partida e convoque os jogadores. Gerencie tudo por aqui."
                    : "Crie seu grupo, chame a galera e esqueça a planilha. O jeito mais fácil de gerenciar sua pelada."}
            </p>

            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <Link
                    href={hasGroups ? "/dashboard/grupos" : "/dashboard/criar-grupo"}
                    className="w-full h-14 rounded-full bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#13ec5b]/25 hover:scale-105"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    {hasGroups ? "Criar Nova Pelada" : "Criar Time"}
                </Link>

                <Link
                    href="/dashboard/explorar"
                    className="text-sm font-bold text-[#4c9a66] dark:text-[#8baaa0] hover:text-[#13ec5b] dark:hover:text-white transition-colors"
                >
                    Ou procure uma pelada para jogar
                </Link>
            </div>
        </div>
    );
}
