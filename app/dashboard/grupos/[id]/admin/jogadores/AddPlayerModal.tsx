import { useState } from "react";
import { supabase } from "../../../../../../src/lib/client";
import { toast } from "sonner";

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupId: string;
}

export function AddPlayerModal({ isOpen, onClose, onSuccess, groupId }: AddPlayerModalProps) {
    const [activeTab, setActiveTab] = useState<'invite' | 'manual'>('invite');
    const [loading, setLoading] = useState(false);

    // Manual Form State
    const [formData, setFormData] = useState({
        name: "",
        type: "DIARISTA",
        position: "",
        skillLevel: "3", // Default stats
        notes: ""
    });

    if (!isOpen) return null;

    const handleCopyInvite = () => {
        const link = `${window.location.origin}/dashboard/grupos/${groupId}?join=1`;
        navigator.clipboard.writeText(link).then(() => {
            toast.success("Link de convite copiado!");
        }).catch(() => {
            toast.error("Erro ao copiar link.");
        });
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name) throw new Error("Nome é obrigatório.");

            // Map skill level number to text if needed, or store as number in text column
            // existing code uses text logic: "Iniciante", "Intermediário", etc.
            // Let's store consistent text.
            let skillText = "Intermediário";
            if (formData.skillLevel === "1") skillText = "Iniciante";
            if (formData.skillLevel === "2") skillText = "Iniciante/Médio";
            if (formData.skillLevel === "3") skillText = "Intermediário";
            if (formData.skillLevel === "4") skillText = "Avançado";
            if (formData.skillLevel === "5") skillText = "Craque";

            const payload = {
                group_id: groupId,
                user_id: null, // Critical: Manual player has no user_id
                role: 'member',
                status: 'active',
                payment_type: formData.type,
                is_manual: true,
                manual_name: formData.name,
                manual_position: formData.position,
                manual_skill_level: skillText,
                manual_notes: formData.notes,
                joined_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('group_members')
                .insert(payload);

            if (error) throw error;

            toast.success("Jogador adicionado com sucesso!");
            onSuccess();
            onClose();
            // Reset form
            setFormData({ name: "", type: "DIARISTA", position: "", skillLevel: "3", notes: "" });

        } catch (error: any) {
            console.error("Error adding manual player:", error);
            toast.error(error.message || "Erro ao adicionar jogador.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a2c22] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Adicionar Jogador</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('invite')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'invite'
                            ? 'bg-white dark:bg-slate-800 text-[#0d1b12] dark:text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        Convidar Link
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'manual'
                            ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm shadow-[#13ec5b]/20'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Manual (Sem Conta)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'invite' ? (
                        <div className="flex flex-col gap-6 text-center py-4">
                            <div className="w-16 h-16 bg-[#13ec5b]/10 rounded-full flex items-center justify-center mx-auto text-[#13ec5b]">
                                <span className="material-symbols-outlined text-3xl">link</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Envie o link para a galera</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Quem entrar pelo link precisará criar uma conta para confirmar presença e acessar o histórico.
                                </p>
                            </div>
                            <button
                                onClick={handleCopyInvite}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">content_copy</span>
                                Copiar Link de Convite
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                Jogador manual não precisa de conta para participar.
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome ou Apelido <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 outline-none focus:border-[#13ec5b] transition-all font-semibold"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipo de Jogador</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['MENSALISTA', 'DIARISTA', 'CONVIDADO'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${formData.type === type
                                                ? 'bg-[#13ec5b]/10 border-[#13ec5b] text-[#0d1b12]'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Posição</label>
                                    <select
                                        value={formData.position}
                                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 outline-none focus:border-[#13ec5b] transition-all font-semibold appearance-none"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Goleiro">Goleiro</option>
                                        <option value="Zagueiro">Zagueiro</option>
                                        <option value="Lateral">Lateral</option>
                                        <option value="Meio">Meio</option>
                                        <option value="Ataque">Ataque</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nível</label>
                                    <div className="flex items-center justify-between h-12 px-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, skillLevel: String(star) })}
                                                className={`p-1 transition-transform hover:scale-110 ${Number(formData.skillLevel) >= star ? 'text-amber-400' : 'text-slate-300'}`}
                                            >
                                                <span className="material-symbols-outlined icon-filled text-[20px]">star</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full h-20 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 outline-none focus:border-[#13ec5b] transition-all font-medium text-sm resize-none"
                                    placeholder="Detalhes adicionais..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full h-12 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-[#13ec5b]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                            >
                                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Salvar Jogador'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
