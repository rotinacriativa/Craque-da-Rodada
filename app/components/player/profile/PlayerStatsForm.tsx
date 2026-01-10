interface PlayerStatsFormProps {
    position: string;
    dominantFoot: string;
    jerseyNumber: string;
    skillLevel: string;
    onPositionChange: (value: string) => void;
    onDominantFootChange: (value: string) => void;
    onJerseyNumberChange: (value: string) => void;
    onSkillLevelChange: (value: string) => void;
}

export function PlayerStatsForm({
    position,
    dominantFoot,
    jerseyNumber,
    skillLevel,
    onPositionChange,
    onDominantFootChange,
    onJerseyNumberChange,
    onSkillLevelChange
}: PlayerStatsFormProps) {
    return (
        <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 text-[#0d1b12] dark:text-white">
                    <span className="material-symbols-outlined text-[#13ec5b]">sports_soccer</span>
                    Ficha do Jogador
                </h3>
                <span className="bg-[#13ec5b]/10 text-[#0eb545] dark:text-[#13ec5b] text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Editável
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-[#4c9a66]">Posição Preferida</span>
                    <div className="flex flex-wrap gap-2">
                        {['Goleiro', 'Defesa', 'Meio', 'Ataque'].map(pos => (
                            <button
                                key={pos}
                                onClick={() => onPositionChange(pos)}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${position === pos
                                        ? 'bg-[#13ec5b] text-[#0d1b12] border-[#13ec5b] shadow-md font-bold'
                                        : 'border-[#e7f3eb] dark:border-[#2a4032] opacity-70 hover:opacity-100 hover:border-[#13ec5b] text-[#0d1b12] dark:text-white'
                                    }`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-[#4c9a66]">Pé Dominante</span>
                    <div className="flex bg-[#f6f8f6] dark:bg-[#102216] p-1 rounded-lg border border-[#e7f3eb] dark:border-[#2a4032]">
                        {['Esquerdo', 'Direito', 'Ambos'].map(foot => (
                            <button
                                key={foot}
                                onClick={() => onDominantFootChange(foot)}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${dominantFoot === foot
                                        ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm font-bold'
                                        : 'text-[#4c9a66] hover:text-[#0d1b12] dark:hover:text-white'
                                    }`}
                            >
                                {foot}
                            </button>
                        ))}
                    </div>
                </div>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Camisa Favorita</span>
                    <div className="relative">
                        <input
                            className="w-full h-12 pl-4 pr-12 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-black text-lg text-[#0d1b12] dark:text-white"
                            type="number"
                            value={jerseyNumber}
                            onChange={(e) => onJerseyNumberChange(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#4c9a66]">
                            checkroom
                        </span>
                    </div>
                </label>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[#4c9a66]">Nível Técnico</span>
                        <span className="text-xs font-bold text-[#13ec5b] bg-[#13ec5b]/10 px-2 py-0.5 rounded">
                            {skillLevel || 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032]">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => onSkillLevelChange(
                                    star === 1 ? 'Iniciante' :
                                        star === 2 ? 'Amador' :
                                            star === 3 ? 'Intermediário' :
                                                star === 4 ? 'Avançado' : 'Craque'
                                )}
                                className="text-[#13ec5b] hover:scale-110 transition-transform cursor-pointer"
                            >
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    style={{
                                        fontVariationSettings: `'FILL' ${['Iniciante', 'Amador', 'Intermediário', 'Avançado', 'Craque'].indexOf(skillLevel) >= star - 1 ? 1 : 0
                                            }`
                                    }}
                                >
                                    star
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
