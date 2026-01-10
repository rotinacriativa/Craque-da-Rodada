import Link from "next/link";
import { formatDateForMatchList } from "../../../../src/lib/utils";
import ShareButton from "../../../components/ShareButton";

interface NextMatchCardProps {
    match: {
        id: string;
        name: string;
        date: string;
        start_time: string;
        location: string;
        group_id: string;
    };
    groupName: string;
    participants: Array<{
        full_name: string;
        avatar_url: string | null;
    }>;
}

export function NextMatchCard({ match, groupName, participants }: NextMatchCardProps) {
    return (
        <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-6 rounded-[2rem] bg-white dark:bg-[#1a2c20] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e7f3eb] dark:border-[#2a4535]">
            {/* Card Image */}
            <div
                className="w-full md:w-2/5 aspect-video md:aspect-auto bg-center bg-no-repeat bg-cover rounded-2xl md:rounded-3xl relative overflow-hidden group"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn1zLjEVJzzbfA6TQsi4mPWz6DPyZISrjM0oARG6tm3U10eaDmXgvuI2GeKtu4JeDz9JDEk-owaU-S7vJfd4sIzvuVbq7ayVwMnDDe-3flpSS5MSRFQh0NF_iQA8zsBmgzUMSvcsWVjM52PW6HwezkjqUIJm0WTiw7GcwK6tIPhcG6iLsbKByd886Zta5l-e6_GVFpQy_33J5uZ4z-sdbLRaR8dQjp-08S4aOYRmdiQB_QUUL1Sj6KeNbAa1T6L-lyQfMRCKjY-Rg')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />

                <div className="absolute top-4 left-4 bg-[#13ec5b] text-[#0d1b12] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    Confirmado
                </div>

                <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-sm">cloud</span>
                        <span className="text-xs font-medium">18°C • Sem chuva</span>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="flex flex-1 flex-col gap-4 pt-4 md:pt-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[#13ec5b] text-sm font-bold uppercase tracking-wide">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        {formatDateForMatchList(match.date, match.start_time)}
                    </div>

                    <h3 className="text-[#0d1b12] dark:text-white text-2xl md:text-3xl font-bold leading-tight">
                        {match.name} - {groupName}
                    </h3>

                    <div className="flex items-center gap-2 text-[#4c9a66] text-sm md:text-base font-medium mt-1">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                        {match.location}
                    </div>
                </div>

                {/* Players Section */}
                <div className="flex items-center gap-3 py-2">
                    <div className="flex -space-x-3">
                        {participants.slice(0, 4).map((p, i) => (
                            <div
                                key={i}
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-200 bg-cover bg-center"
                                style={{ backgroundImage: `url('${p.avatar_url || ""}')` }}
                            >
                                {!p.avatar_url && (
                                    <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-gray-500">
                                        {p.full_name?.charAt(0)}
                                    </span>
                                )}
                            </div>
                        ))}
                        {participants.length > 4 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#1a2c20] bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                +{participants.length - 4}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[#0d1b12] dark:text-white font-bold text-sm">
                            {participants.length} Confirmados
                        </span>
                        <span className="text-xs text-[#4c9a66]">Garanta sua vaga!</span>
                    </div>
                </div>

                <div className="mt-auto flex gap-3 pt-4 border-t border-[#e7f3eb] dark:border-[#2a4535]">
                    <Link
                        href={`/dashboard/grupos/${match.group_id}/partidas/${match.id}`}
                        className="flex-1 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0fd651] transition-colors shadow-lg shadow-[#13ec5b]/20 flex"
                    >
                        <span className="truncate">Ver Detalhes do Jogo</span>
                    </Link>
                    <ShareButton />
                </div>
            </div>
        </div>
    );
}
