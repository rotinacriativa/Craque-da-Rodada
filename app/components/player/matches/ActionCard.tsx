interface ActionCardProps {
    isConfirmed: boolean;
    spotsLeft: number;
    confirmedCount: number;
    capacity: number;
    price: number;
    actionLoading: boolean;
    onJoin: () => void;
    onLeave: () => void;
}

export function ActionCard({
    isConfirmed,
    spotsLeft,
    confirmedCount,
    capacity,
    price,
    actionLoading,
    onJoin,
    onLeave
}: ActionCardProps) {
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);

    const priceParts = formattedPrice.replace('R$', '').trim().split(',');
    const priceMajor = priceParts[0];
    const priceMinor = priceParts[1] || '00';

    return (
        <div className="sticky top-24 flex flex-col gap-6">
            <div className="rounded-2xl border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-xl shadow-green-900/5 p-6 flex flex-col gap-6">
                {/* Vacancy Info */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                        <span className="text-sm font-bold text-[#0d1b12] dark:text-white">
                            Confirmado {confirmedCount}/{capacity}
                        </span>
                    </div>

                    <div className="w-full h-3 bg-[#e7f3eb] dark:bg-[#102216] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#13ec5b] rounded-full transition-all duration-500"
                            style={{ width: `${(confirmedCount / capacity) * 100}%` }}
                        />
                    </div>

                    {spotsLeft > 0 && spotsLeft <= 5 && (
                        <div className="flex items-center gap-2 text-[#4c9a66] dark:text-[#13ec5b] text-sm font-medium mt-1">
                            <span className="material-symbols-outlined text-lg">bolt</span>
                            Restam apenas {spotsLeft} vagas!
                        </div>
                    )}
                </div>

                <hr className="border-[#e7f3eb] dark:border-white/10" />

                {/* Cost Info */}
                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Custo por pessoa</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#0d1b12] dark:text-white">
                                R$ {priceMajor}
                            </span>
                            <span className="text-sm font-bold text-gray-400">,{priceMinor}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">Pagamento via App</span>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="flex flex-col gap-3">
                    {isConfirmed ? (
                        <>
                            <button className="group relative flex w-full cursor-default items-center justify-center overflow-hidden rounded-full h-14 bg-green-700 text-white text-lg font-bold">
                                <span className="relative flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Presença Confirmada
                                </span>
                            </button>

                            <button
                                onClick={onLeave}
                                disabled={actionLoading}
                                className="w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">close</span>
                                Sair do Jogo (Liberar Vaga)
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onJoin}
                                disabled={actionLoading || spotsLeft <= 0}
                                className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-[#13ec5b] text-[#0d1b12] text-lg font-bold shadow-lg shadow-green-400/20 hover:shadow-green-400/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-2">
                                    {spotsLeft <= 0 ? 'Entrar na Lista de Espera' : 'Garantir minha Vaga'}
                                    <span className="material-symbols-outlined">sports_soccer</span>
                                </span>
                            </button>

                            {!isConfirmed && (
                                <button className="w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    Não posso ir
                                </button>
                            )}
                        </>
                    )}
                </div>

                <p className="text-xs text-center text-gray-400 dark:text-gray-500 leading-relaxed">
                    Ao confirmar, você concorda com as regras de cancelamento (24h antes).
                </p>
            </div>

            {/* Quick Share */}
            <div className="p-4 rounded-2xl bg-[#13ec5b]/10 border border-[#13ec5b]/20 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="font-bold text-[#0d1b12] dark:text-white text-sm">Convide amigos</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                        Faltam {Math.max(0, capacity - confirmedCount)} pessoas!
                    </span>
                </div>
                <button className="size-10 rounded-full bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white flex items-center justify-center shadow-sm hover:text-[#13ec5b] transition-colors">
                    <span className="material-symbols-outlined">share</span>
                </button>
            </div>
        </div>
    );
}
