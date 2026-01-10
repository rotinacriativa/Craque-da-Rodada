interface DangerZoneProps {
    onDeleteAccount: () => void;
}

export function DangerZone({ onDeleteAccount }: DangerZoneProps) {
    return (
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Zona de Perigo
            </h3>

            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                Encerrar sua carreira no app? A exclusão é permanente e apaga todos os seus dados, grupos e histórico.
            </p>

            <button
                onClick={onDeleteAccount}
                className="w-full py-3 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">delete_forever</span>
                Excluir Minha Conta
            </button>
        </div>
    );
}
