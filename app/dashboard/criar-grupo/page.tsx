"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "../../../src/lib/client";
import { getResilientUser } from "../../../src/lib/auth-helpers";
import Link from "next/link";

export default function CreateGroupPage() {
    const router = useRouter();

    // Core Fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    // Defaults & Hidden/Optional Fields
    const [visibility, setVisibility] = useState("public");
    const [defaultDay, setDefaultDay] = useState("quinta");
    const [defaultTimeStart, setDefaultTimeStart] = useState("20:00");
    const [defaultMaxMembers] = useState("20");

    // Finance Defaults
    const [financialType, setFinancialType] = useState("diarista");
    const [priceMensalista, setPriceMensalista] = useState(0);
    const [priceAvulso, setPriceAvulso] = useState(0);

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Image Upload
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleCreateGroup = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = await getResilientUser(supabase);
            if (!user) throw new Error("Usuário não autenticado");

            if (!name) throw new Error("Preencha o nome da sua pelada.");

            // Financial Validations
            if (financialType === 'mensalista' && priceMensalista <= 0) throw new Error("O valor da mensalidade deve ser maior que zero.");
            if (financialType === 'diarista' && priceAvulso <= 0) throw new Error("O valor por jogo deve ser maior que zero.");
            if (financialType === 'convidado' && priceAvulso <= 0) throw new Error("O valor do convidado deve ser maior que zero.");

            // Smart Defaults
            const finalDescription = description || "Pelada organizada pelo Craque da Rodada.";
            const finalLocation = location || "Local a definir";

            // Prepare payload
            const payload: any = {
                name,
                description: finalDescription,
                city: finalLocation,
                created_by: user.id,
                visibility,
                max_members: parseInt(defaultMaxMembers),
                default_day: defaultDay,
                default_time_start: defaultTimeStart,
                logo_url: logoUrl,
                financial_type: financialType,
                price_mensalista: financialType === 'mensalista' ? priceMensalista : 0,
                price_avulso: financialType !== 'mensalista' ? priceAvulso : 0
            };

            // 1. Create Group
            const { data: group, error: createError } = await supabase
                .from('groups')
                .insert(payload)
                .select()
                .single();

            if (createError) throw createError;

            // 2. Add creator as admin member
            await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'admin',
                    status: 'active'
                });

            // Success! Redirect
            toast.success('Pelada criada! Agora é só convocar a galera. ⚽');
            router.push(`/dashboard/grupos/${group.id}`);
            router.refresh();

        } catch (err: any) {
            console.error("Error creating group:", err);
            const msg = err.message || "Erro ao criar grupo.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            setUploadingLogo(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `group-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('group-logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('group-logos').getPublicUrl(filePath);
            setLogoUrl(publicUrl);

        } catch (error: any) {
            console.error("Error uploading logo:", error);
            // Non-blocking error for logo
            alert("Erro ao fazer upload da imagem. Tente novamente.");
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] p-4 lg:p-10 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-2xl flex flex-col gap-6">

                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-black tracking-tight text-[#0d1b12] dark:text-white mb-2">Organizar Turma</h2>
                    <p className="text-[#4c9a66] dark:text-gray-400">Crie um espaço fixo para somar estatísticas e organizar seus jogos.</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-pulse text-center">
                        {error}
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white dark:bg-[#1a3322] rounded-3xl p-6 md:p-10 shadow-xl border border-[#e7f3eb] dark:border-[#2a4533] relative overflow-hidden">

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#13ec5b]/5 rounded-bl-full pointer-events-none"></div>

                    <div className="flex flex-col gap-8 relative z-10">
                        {/* Logo & Name Row */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Logo Upload */}
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="group relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-[#cfe7d7] bg-[#f8fcf9] hover:border-[#13ec5b] hover:bg-[#f0fdf4] dark:border-gray-600 dark:bg-[#1a3322] dark:hover:border-[#13ec5b] dark:hover:bg-[#2a4533] transition-all overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-[#4c9a66] dark:text-gray-400 group-hover:text-[#13ec5b] transition-colors">
                                            {uploadingLogo ? (
                                                <span className="size-5 border-2 border-[#13ec5b] border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-2xl mb-1">shield</span>
                                                    <span className="text-[10px] font-bold uppercase">Escudo</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        type="file"
                                        onChange={handleLogoUpload}
                                        accept="image/*"
                                        disabled={uploadingLogo}
                                    />
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-[#0d1b12] dark:text-white mb-2 ml-1">Nome da Turma <span className="text-red-500">*</span></label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-14 w-full rounded-2xl border-2 border-[#e7f3eb] bg-[#f8fcf9] px-6 text-xl font-bold outline-none focus:border-[#13ec5b] focus:ring-4 focus:ring-[#13ec5b]/10 dark:border-gray-600 dark:bg-[#102216] dark:text-white transition-all placeholder:font-medium placeholder:text-gray-400"
                                    placeholder="Ex: Terça Sem Lei"
                                    type="text"
                                    autoFocus
                                />
                            </div>
                        </div>



                        {/* Collapsible Details (Simplification: Just show them as minimal inputs) */}
                        <div className="pt-4 border-t border-[#e7f3eb] dark:border-white/5">
                            <details className="group">
                                <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#4c9a66] hover:text-[#13ec5b] transition-colors select-none">
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                                    Mais opções (Descrição, Privacidade)
                                </summary>
                                <div className="mt-4 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">

                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="h-24 w-full rounded-xl border border-[#e7f3eb] bg-white px-4 py-3 text-sm resize-none outline-none focus:border-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] dark:text-white"
                                        placeholder="Descrição breve da pelada..."
                                    ></textarea>
                                    <div className="col-span-1 md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#4c9a66] dark:text-gray-400 mb-2 ml-1 uppercase tracking-wide">Regra Financeira (Tipo do Grupo)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['mensalista', 'diarista', 'convidado'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFinancialType(type)}
                                                        className={`py-2 px-1 rounded-xl text-xs font-bold capitalize border-2 transition-all ${financialType === type
                                                            ? 'border-[#13ec5b] bg-[#13ec5b]/10 text-[#0d1b12]'
                                                            : 'border-transparent bg-gray-100 dark:bg-[#102216] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#1a3322]'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {financialType === 'mensalista' && (
                                            <div>
                                                <label className="block text-xs font-bold text-[#4c9a66] dark:text-gray-400 mb-1 ml-1 uppercase tracking-wide">Valor Mensal (Cobrança Fixa)</label>
                                                <div className="flex items-center gap-2 bg-white dark:bg-[#1a3322] border border-[#e7f3eb] dark:border-gray-600 rounded-xl px-4 py-2">
                                                    <span className="text-gray-400 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={priceMensalista}
                                                        onChange={(e) => setPriceMensalista(Number(e.target.value))}
                                                        className="w-full bg-transparent text-sm font-bold outline-none dark:text-white"
                                                        placeholder="0,00"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {financialType === 'diarista' && (
                                            <div>
                                                <label className="block text-xs font-bold text-[#4c9a66] dark:text-gray-400 mb-1 ml-1 uppercase tracking-wide">Valor por Jogo (Por Pessoa)</label>
                                                <div className="flex items-center gap-2 bg-white dark:bg-[#1a3322] border border-[#e7f3eb] dark:border-gray-600 rounded-xl px-4 py-2">
                                                    <span className="text-gray-400 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={priceAvulso}
                                                        onChange={(e) => setPriceAvulso(Number(e.target.value))}
                                                        className="w-full bg-transparent text-sm font-bold outline-none dark:text-white"
                                                        placeholder="0,00"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {financialType === 'convidado' && (
                                            <div>
                                                <label className="block text-xs font-bold text-[#4c9a66] dark:text-gray-400 mb-1 ml-1 uppercase tracking-wide">Valor do Convidado</label>
                                                <div className="flex items-center gap-2 bg-white dark:bg-[#1a3322] border border-[#e7f3eb] dark:border-gray-600 rounded-xl px-4 py-2">
                                                    <span className="text-gray-400 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={priceAvulso}
                                                        onChange={(e) => setPriceAvulso(Number(e.target.value))}
                                                        className="w-full bg-transparent text-sm font-bold outline-none dark:text-white"
                                                        placeholder="0,00"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setVisibility("public")}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border ${visibility === 'public' ? 'bg-[#13ec5b]/10 border-[#13ec5b] text-[#0d1b12]' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            Público
                                        </button>
                                        <button
                                            onClick={() => setVisibility("private")}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border ${visibility === 'private' ? 'bg-[#13ec5b]/10 border-[#13ec5b] text-[#0d1b12]' : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            Privado
                                        </button>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-2">
                            <button
                                onClick={handleCreateGroup}
                                disabled={loading}
                                className="w-full h-16 rounded-2xl bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] text-xl font-black shadow-lg shadow-[#13ec5b]/30 hover:shadow-[#13ec5b]/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="size-6 border-3 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span>Criar Turma e Marcar Jogo</span>
                                        <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                    </>
                                )}
                            </button>
                            <Link
                                href="/dashboard/grupos"
                                className="text-center text-sm font-bold text-gray-400 hover:text-[#0d1b12] dark:hover:text-white transition-colors py-2"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
