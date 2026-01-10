interface MatchHeaderProps {
    match: {
        name: string;
        date: string;
        start_time: string;
        end_time: string;
    };
    groupName: string;
    spotsLeft: number;
    isAdmin: boolean;
    matchId: string;
    groupId: string;
    onCancelMatch?: () => void;
}

export function MatchHeader({
    match,
    groupName,
    spotsLeft,
    isAdmin,
    matchId,
    groupId,
    onCancelMatch
}: MatchHeaderProps) {
    const dateStr = new Date(match.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                {spotsLeft > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#13ec5b]/20 px-3 py-1 text-sm font-bold text-green-800 dark:text-green-300">
                        <span className="size-2 rounded-full bg-[#13ec5b] animate-pulse" />
                        {spotsLeft} Vagas Abertas
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-800">
                        Lotado
                    </span>
                )}

                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Competitivo
                </span>

                {isAdmin && (
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        <button
                            onClick={onCancelMatch}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-full text-xs font-bold text-red-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Excluir
                        </button>
                    </div>
                )}
            </div>

            <div>
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-[#0d1b12] dark:text-white mb-2">
                    {match.name}
                </h1>
                <p className="text-lg md:text-xl text-[#4c9a66] dark:text-[#13ec5b] font-medium flex items-center gap-2 capitalize">
                    <span className="material-symbols-outlined">calendar_month</span>
                    {dateStr} • {match.start_time.slice(0, 5)} - {match.end_time?.slice(0, 5)}
                </p>
            </div>
        </div>
    );
}
