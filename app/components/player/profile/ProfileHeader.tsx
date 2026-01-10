import { useRef } from "react";

interface ProfileHeaderProps {
    fullName: string;
    email: string;
    avatarUrl: string | null;
    emailVerified: boolean;
    onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
    fullName,
    email,
    avatarUrl,
    emailVerified,
    onAvatarUpload
}: ProfileHeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#13ec5b]/20 to-transparent" />

            <div className="relative flex flex-col items-center">
                <div className="relative mb-4 group-hover:scale-105 transition-transform">
                    <div
                        className="size-32 rounded-full border-4 border-white dark:border-[#1a2e22] shadow-md bg-cover bg-center bg-gray-200"
                        style={{ backgroundImage: avatarUrl ? `url('${avatarUrl}')` : 'none' }}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={onAvatarUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-[#0d1b12] text-white rounded-full hover:bg-[#13ec5b] hover:text-[#0d1b12] transition-colors shadow-lg border-2 border-white dark:border-[#1a2e22] cursor-pointer"
                        title="Alterar foto"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-center text-[#0d1b12] dark:text-white">
                    {fullName || "Nome do Jogador"}
                </h2>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-[#4c9a66] text-sm font-medium">{email}</p>
                    {emailVerified ? (
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full" title="Email Confirmado">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[14px]">verified</span>
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase">Verificado</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full" title="Email Pendente">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[14px]">warning</span>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Pendente</span>
                        </div>
                    )}
                </div>

                {/* Simple Stats for Visual Appeal */}
                <div className="w-full grid grid-cols-3 gap-2 border-t border-[#e7f3eb] dark:border-[#2a4032] pt-6 mt-2">
                    <div className="text-center">
                        <p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">Jogos</p>
                        <p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p>
                    </div>
                    <div className="text-center border-l border-r border-[#e7f3eb] dark:border-[#2a4032]">
                        <p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">Gols</p>
                        <p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">MVPs</p>
                        <p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
