interface Participant {
    id: string;
    user_id: string;
    profile: {
        full_name: string;
        avatar_url: string | null;
        position?: string;
    };
}

interface ParticipantsListProps {
    confirmedPlayers: Participant[];
    capacity: number;
    onCopyLink: () => void;
}

export function ParticipantsList({
    confirmedPlayers,
    capacity,
    onCopyLink
}: ParticipantsListProps) {
    if (confirmedPlayers.length === 0) {
        return (
            <div className="bg-white dark:bg-[#183020] rounded-xl p-8 border-2 border-dashed border-[#e7f3eb] dark:border-[#2a4535] flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 dark:bg-[#102216] p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-3xl">person_off</span>
                </div>
                <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white mb-2">
                    Ninguém confirmou ainda
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-6">
                    Mande o link no grupo do WhatsApp para a galera confirmar a presença.
                </p>
                <button
                    onClick={onCopyLink}
                    className="px-6 py-2.5 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-colors shadow-lg shadow-[#13ec5b]/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">share</span>
                    Convidar Galera
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedPlayers.map(p => (
                <div
                    key={p.id}
                    className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800"
                >
                    <div className="relative">
                        <div
                            className="size-12 rounded-full bg-gray-300 bg-cover bg-center"
                            style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] p-0.5 rounded-full border-2 border-white dark:border-[#102216]">
                            <span className="material-symbols-outlined text-[10px] block font-bold">check</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-[#0d1b12] dark:text-white">
                            {p.profile.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.profile.position || 'Jogador'}
                        </p>
                    </div>
                </div>
            ))}

            {/* Placeholder for empty spots */}
            {Array.from({ length: Math.max(0, capacity - confirmedPlayers.length) })
                .slice(0, 2)
                .map((_, i) => (
                    <div
                        key={`empty-${i}`}
                        className="flex items-center p-3 gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-700 opacity-60"
                    >
                        <div className="size-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">person</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-400">Vaga disponível</p>
                            <p className="text-xs text-gray-400">Convide um amigo</p>
                        </div>
                    </div>
                ))}
        </div>
    );
}
