import Link from "next/link";
import { formatDateForGroup } from "../../../../src/lib/utils";

interface Match {
    id: string;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    match_participants?: any[];
}

interface MatchListProps {
    matches: Match[];
    groupId: string;
    isLoading?: boolean;
}

export function MatchList({ matches, groupId, isLoading }: MatchListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <span className="size-8 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin" />
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-gray-50 dark:bg-[#183020] border-2 border-dashed border-gray-200 dark:border-[#2a4031]">
                <div className="bg-[#13ec5b]/10 p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-3xl text-[#0ea841] dark:text-[#13ec5b]">
                        sports_soccer
                    </span>
                </div>
                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white mb-2">
                    Nenhum jogo marcado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                    A bola não pode parar! Marque o próximo jogo da galera.
                </p>
                <Link
                    href={`/dashboard/grupos/${groupId}/nova-partida`}
                    className="flex items-center gap-2 px-6 py-3 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] rounded-full font-bold transition-all shadow-lg hover:shadow-[#13ec5b]/20"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Marcar Jogo
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {matches.map((match) => {
                const dateInfo = formatDateForGroup(match.date);
                const participantCount = match.match_participants?.length || 0;

                return (
                    <div
                        key={match.id}
                        className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#13ec5b]/30 shadow-[0_4px_20px_-4px_rgba(19,236,91,0.15)] transition-transform hover:-translate-y-1 duration-300"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                {/* Date Badge */}
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] rounded-2xl shrink-0">
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {dateInfo.month}
                                    </span>
                                    <span className="text-2xl font-black leading-none">
                                        {dateInfo.day}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">
                                            {match.name}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase border border-green-200 dark:border-green-800">
                                            Confirmado
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                                            <span>{match.start_time.slice(0, 5)} - {match.end_time.slice(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                                            <span className="truncate max-w-[250px]">{match.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center sm:self-center gap-3 mt-2 sm:mt-0">
                                {/* Avatars - hidden on mobile for space */}
                                <div className="flex -space-x-2 mr-2 hidden md:flex">
                                    {match.match_participants?.slice(0, 3).map((participant: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-200 bg-cover"
                                        >
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                ?
                                            </div>
                                        </div>
                                    ))}
                                    {participantCount > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1f3b29] bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            +{participantCount - 3}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={`/dashboard/partidas/${match.id}`}
                                    className="w-full sm:w-auto bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm shadow-[#13ec5b]/30 flex items-center justify-center gap-2"
                                >
                                    <span>Ver partida</span>
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
