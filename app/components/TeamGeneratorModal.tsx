
import { useState } from "react";

interface Player {
    id: string;
    profile: {
        full_name: string;
        avatar_url: string | null;
        position?: string;
        skill_level?: string;
    };
}

interface TeamGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    players: Player[];
    onSave: (teams: { teamA: string[], teamB: string[], teamC: string[], teamD: string[] }) => Promise<void>;
}

export default function TeamGeneratorModal({ isOpen, onClose, players, onSave }: TeamGeneratorModalProps) {
    const [numTeams, setNumTeams] = useState(2);
    const [generatedTeams, setGeneratedTeams] = useState<Player[][]>([]);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const generateTeams = () => {
        // 1. Separar Goleiros e Linha
        const goalkeepers = players.filter(p => p.profile.position?.toLowerCase().includes('goleiro'));
        const linePlayers = players.filter(p => !p.profile.position?.toLowerCase().includes('goleiro'));

        const getSkill = (p: Player) => {
            const skill = parseFloat(p.profile.skill_level || "3");
            return isNaN(skill) ? 3 : skill;
        };

        // 2. Ordenar por habilidade (do maior para o menor)
        goalkeepers.sort((a, b) => getSkill(b) - getSkill(a));
        linePlayers.sort((a, b) => getSkill(b) - getSkill(a));

        // 3. Inicializar times
        const teams: Player[][] = Array.from({ length: numTeams }, () => []);
        const teamSkills = new Array(numTeams).fill(0); // Para controle de balanceamento

        // 4. Distribuir Goleiros (Snake Draft simplificado para garantir 1 por time se possível)
        goalkeepers.forEach((gk, index) => {
            const teamIndex = index % numTeams;
            teams[teamIndex].push(gk);
            teamSkills[teamIndex] += getSkill(gk);
        });

        // 5. Distribuir Jogadores de Linha (Snake Draft inteligente)
        // O algoritmo sempre joga o melhor jogador disponível no time que tem a MENOR soma de habilidade acumulada
        // Isso balanceia melhor do que o snake draft puro fixo
        linePlayers.forEach((p) => {
            // Encontrar o time com a menor soma de habilidade atual
            let minSkill = Infinity;
            let targetTeamIndex = 0;

            for (let i = 0; i < numTeams; i++) {
                // Se estamos nos primeiros rounds e o time tem menos jogadores que os outros, prioriza ele
                // (pra evitar que um time fique com 1 craque e os outros com 5 bagres)
                const minPlayers = Math.min(...teams.map(t => t.length));
                if (teams[i].length < minPlayers) {
                    targetTeamIndex = i;
                    break;
                }

                if (teamSkills[i] < minSkill) {
                    minSkill = teamSkills[i];
                    targetTeamIndex = i;
                }
            }

            // Backup logic: se empatar, usa o snake normal ou roda
            // Vamos simplificar: sortear times por skill total crescente e pegar o primeiro
            // Mas o loop acima já meio que faz isso.

            // Refinamento: Snake Draft Puro (mais previsível e justo socialmente)
            // A lógica de "soma" as vezes cria times com 1 Pelé e 10 Bagres.
            // Vamos mudar para Snake Draft Puro.
        });

        // Reset para usar Snake Draft Puro
        teams.forEach(t => t.length = 0); // Limpar (mas manter goleiros? Não, refazer tudo com os goleiros já alocados é melhor)
        // Recalcular
        const newTeams: Player[][] = Array.from({ length: numTeams }, () => []);

        // Distribuir Goleiros
        goalkeepers.forEach((gk, index) => {
            newTeams[index % numTeams].push(gk);
        });

        // Distribuir Linha (Snake)
        linePlayers.forEach((p, index) => {
            const round = Math.floor(index / numTeams);
            const isEven = round % 2 === 0;
            const teamIndex = isEven ? (index % numTeams) : (numTeams - 1 - (index % numTeams));
            newTeams[teamIndex].push(p);
        });

        setGeneratedTeams(newTeams);
    };

    const handleConfirm = async () => {
        setIsSaving(true);
        // Map teams to A, B, C, D
        const teamsMap = {
            teamA: generatedTeams[0]?.map(p => p.id) || [],
            teamB: generatedTeams[1]?.map(p => p.id) || [],
            teamC: generatedTeams[2]?.map(p => p.id) || [],
            teamD: generatedTeams[3]?.map(p => p.id) || []
        };
        await onSave(teamsMap);
        setIsSaving(false);
        onClose();
    };

    const getAverageSkill = (team: Player[]) => {
        if (!team.length) return 0;
        const total = team.reduce((acc, p) => acc + (parseFloat(p.profile.skill_level || "3") || 3), 0);
        return (total / team.length).toFixed(1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1a2c22] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-[#0d1b12] dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec5b]">shuffle</span>
                            Sorteio de Times
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Baseado no nível de habilidade e posição.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {generatedTeams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-6">
                            <div className="flex flex-col gap-2 w-full max-w-xs">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Quantos times?</label>
                                <div className="flex gap-2">
                                    {[2, 3, 4].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setNumTeams(n)}
                                            className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${numTeams === n
                                                ? 'border-[#13ec5b] bg-[#13ec5b]/10 text-[#0d1b12] dark:text-white'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                                        >
                                            {n} Times
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={generateTeams}
                                className="px-8 py-4 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-black rounded-xl shadow-lg shadow-[#13ec5b]/20 hover:scale-105 transition-all flex items-center gap-2 text-lg"
                            >
                                <span className="material-symbols-outlined">casino</span>
                                Sortear Agora
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-bold text-[#0d1b12] dark:text-white">{players.length}</span> jogadores • <span className="font-bold text-[#0d1b12] dark:text-white">{numTeams}</span> times
                                </div>
                                <button
                                    onClick={generateTeams}
                                    className="text-sm font-bold text-[#13ec5b] hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                    Sortear Novamente
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {generatedTeams.map((team, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-white/10">
                                            <h3 className="font-bold text-[#0d1b12] dark:text-white flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'][index]}`}></span>
                                                Time {String.fromCharCode(65 + index)}
                                            </h3>
                                            <span className="text-xs font-mono bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 overflow-hidden" title="Média de Habilidade">
                                                ★ {getAverageSkill(team)}
                                            </span>
                                        </div>
                                        <ul className="flex flex-col gap-2">
                                            {team.map(p => (
                                                <li key={p.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <div
                                                        className="w-6 h-6 rounded-full bg-cover bg-center bg-gray-300"
                                                        style={{ backgroundImage: `url('${p.profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}
                                                    ></div>
                                                    <span className="truncate flex-1">{p.profile.full_name.split(' ')[0]}</span>
                                                    {p.profile.position === 'Goleiro' && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">GL</span>}
                                                    <span className="text-xs text-gray-400 font-mono">{p.profile.skill_level || '-'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    {generatedTeams.length > 0 && (
                        <button
                            onClick={handleConfirm}
                            disabled={isSaving}
                            className="px-8 py-3 bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-[#13ec5b]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? 'Salvando...' : 'Confirmar Times'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
