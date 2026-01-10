interface Participant {
    id: string;
    user_id: string;
    profile: {
        full_name: string;
        avatar_url: string | null;
        position?: string;
    };
}

interface VoteResult {
    userId: string;
    count: number;
    user: Participant;
}

interface VotingSectionProps {
    isConfirmed: boolean;
    showVoting: boolean;
    myVote: { voted_user_id: string } | null;
    voteResults: VoteResult[] | null;
    confirmedPlayers: Participant[];
    currentUserId: string | null;
    actionLoading: boolean;
    onShowVoting: () => void;
    onVote: (userId: string) => void;
}

export function VotingSection({
    isConfirmed,
    showVoting,
    myVote,
    voteResults,
    confirmedPlayers,
    currentUserId,
    actionLoading,
    onShowVoting,
    onVote
}: VotingSectionProps) {
    if (!isConfirmed) return null;

    return (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-600">stars</span>
                    <div>
                        <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">
                            Quem foi o Craque?
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Vote no melhor em campo e ajude a montar o ranking da pelada.
                        </p>
                    </div>
                </div>
                {!showVoting && !myVote && (
                    <button
                        onClick={onShowVoting}
                        className="text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-[#0d1b12] px-4 py-2 rounded-full transition-colors shadow-sm"
                    >
                        Votar Agora
                    </button>
                )}
            </div>

            {/* VOTING LIST */}
            {showVoting && !myVote && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                    {confirmedPlayers.filter(p => p.user_id !== currentUserId).map(p => (
                        <button
                            key={p.id}
                            onClick={() => onVote(p.user_id)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#1a2c22] border border-yellow-200 hover:border-yellow-400 transition-all text-left group"
                        >
                            <div
                                className="size-10 rounded-full bg-cover bg-center bg-gray-200 shrink-0"
                                style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}
                            />
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-[#0d1b12] dark:text-white truncate group-hover:text-yellow-600 transition-colors">
                                    {p.profile.full_name}
                                </p>
                                <p className="text-[10px] text-gray-500">Votar</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* RESULTS (After voting) */}
            {myVote && voteResults && (
                <div className="flex flex-col gap-3">
                    {voteResults.slice(0, 3).map((r, i) => (
                        <div key={r.userId} className="flex items-center gap-3">
                            <span className={`font-black text-lg w-6 text-center ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                {i + 1}º
                            </span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-[#0d1b12] dark:text-white">
                                        {r.user.profile.full_name}
                                    </span>
                                    <span className="font-bold text-xs text-gray-500">
                                        {r.count} votos
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: `${(r.count / confirmedPlayers.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
