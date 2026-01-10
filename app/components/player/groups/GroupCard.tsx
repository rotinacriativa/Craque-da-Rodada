import Link from "next/link";

interface GroupCardProps {
    group: {
        id: string;
        name: string;
        description?: string;
        image_url?: string;
    };
    isAdmin?: boolean;
}

export function GroupCard({ group, isAdmin = false }: GroupCardProps) {
    return (
        <Link
            href={`/dashboard/grupos/${group.id}`}
            className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 border border-[#e7f3eb] dark:border-[#2a4535] hover:border-[#13ec5b] hover:shadow-xl hover:shadow-[#13ec5b]/10 transition-all group flex flex-col h-full"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="size-14 rounded-2xl bg-gray-100 dark:bg-[#102216] bg-cover bg-center border-2 border-white dark:border-[#2a4535] shadow-sm"
                    style={{ backgroundImage: group.image_url ? `url('${group.image_url}')` : 'none' }}
                >
                    {!group.image_url && (
                        <span className="flex h-full w-full items-center justify-center text-2xl">⚽</span>
                    )}
                </div>
                {isAdmin && (
                    <span className="px-3 py-1 bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] text-xs font-bold uppercase rounded-full">
                        Admin
                    </span>
                )}
            </div>

            <h3 className="font-bold text-xl text-[#0d1b12] dark:text-white mb-2 line-clamp-1">
                {group.name}
            </h3>

            <p className="text-sm text-[#4c9a66] dark:text-[#8baaa0] line-clamp-2 mb-6 flex-1">
                {group.description || "Sem descrição definida."}
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-[#0d1b12] dark:text-white mt-auto pt-4 border-t border-[#f0f7f2] dark:border-[#2a4535] group-hover:text-[#13ec5b] transition-colors">
                <span>Acessar Painel</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
        </Link>
    );
}
