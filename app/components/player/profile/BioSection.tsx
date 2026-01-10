interface BioSectionProps {
    bio: string;
    onBioChange: (bio: string) => void;
}

export function BioSection({ bio, onBioChange }: BioSectionProps) {
    return (
        <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#13ec5b]">person</span>
                <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Sobre Mim</h3>
            </div>

            <label className="block">
                <textarea
                    className="w-full min-h-[120px] rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] p-3 text-sm focus:ring-2 focus:ring-[#13ec5b] focus:border-[#13ec5b] resize-none transition-all placeholder:text-[#4c9a66]/50 text-[#0d1b12] dark:text-white focus:outline-none"
                    placeholder="Conte um pouco sobre seu estilo de jogo..."
                    value={bio}
                    onChange={(e) => onBioChange(e.target.value)}
                />
            </label>
        </div>
    );
}
