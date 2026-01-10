import Link from "next/link";

export function EmptyGroupsState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[3rem] bg-white dark:bg-[#1a2c20] border-2 border-dashed border-[#e7f3eb] dark:border-[#2a4535]">
            <div className="bg-[#13ec5b]/10 p-6 rounded-full mb-6 animate-pulse">
                <span className="material-symbols-outlined text-5xl text-[#0ea841] dark:text-[#13ec5b]">
                    sports_soccer
                </span>
            </div>

            <h2 className="text-2xl font-black text-[#0d1b12] dark:text-white mb-3">
                Nenhuma pelada por aqui
            </h2>

            <p className="text-[#4c9a66] dark:text-[#8baaa0] mb-8 max-w-sm text-lg">
                Tá parado por quê? Crie sua pelada ou entre na de um parceiro para começar a resenha.
            </p>

            <Link
                href="/dashboard/criar-grupo"
                className="h-14 px-8 rounded-full bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold flex items-center gap-2 transition-all shadow-xl shadow-[#13ec5b]/20 hover:scale-105"
            >
                <span className="material-symbols-outlined">add_circle</span>
                Criar Pelada
            </Link>
        </div>
    );
}
