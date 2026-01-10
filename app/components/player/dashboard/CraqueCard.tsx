interface CraqueCardProps {
    craque: {
        full_name: string;
        avatar_url: string | null;
        votes: number;
    } | null;
}

export function CraqueCard({ craque }: CraqueCardProps) {
    if (!craque) {
        return (
            <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm flex items-center justify-center text-center">
                <div>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#22382b] rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <span className="material-symbols-outlined">emoji_events</span>
                    </div>
                    <h4 className="font-bold text-[#0d1b12] dark:text-white">Sem Craque Recente</h4>
                    <p className="text-xs text-gray-500 mt-1">Jogue e vote para eleger o melhor.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-[#1a2c20] rounded-[2rem] p-6 border border-yellow-200 dark:border-yellow-900/30 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <h4 className="font-bold text-lg text-[#0d1b12] dark:text-white mb-1">
                        Último Craque
                    </h4>
                    <p className="text-xs text-[#4c9a66] dark:text-gray-400">
                        O melhor em campo da última rodada
                    </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 p-2 rounded-lg">
                    <span className="material-symbols-outlined">stars</span>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-4 relative z-10">
                <div className="size-16 rounded-full border-4 border-yellow-400 p-0.5 bg-white dark:bg-[#1a2c20]">
                    <div
                        className="w-full h-full rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${craque.avatar_url || ""}')` }}
                    >
                        {!craque.avatar_url && (
                            <span className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 font-bold rounded-full">
                                {craque.full_name?.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <p className="font-black text-xl text-[#0d1b12] dark:text-white leading-none mb-1">
                        {craque.full_name}
                    </p>
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                        {craque.votes} Votos
                    </p>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute -bottom-8 -right-8 text-yellow-500/10 dark:text-yellow-500/5 rotate-12">
                <span className="material-symbols-outlined text-[150px]">trophy</span>
            </div>
        </div>
    );
}
