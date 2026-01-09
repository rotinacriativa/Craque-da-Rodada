"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import Link from "next/link";

export default function CreateGroupPage() {
    const router = useRouter();

    // Core Fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [visibility, setVisibility] = useState("public");

    // Pattern Fields
    const [defaultDay, setDefaultDay] = useState("quinta");
    const [defaultTimeStart, setDefaultTimeStart] = useState("20:00");
    const [defaultMaxMembers, setDefaultMaxMembers] = useState("20");

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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            if (!name) throw new Error("Por favor, preencha o Nome do Grupo.");
            if (!location) throw new Error("Por favor, preencha a Cidade/Bairro.");
            if (!description) throw new Error("Por favor, adicione uma Descrição Curta.");

            // Prepare payload
            const payload: any = {
                name,
                description,
                city: location,
                created_by: user.id,
                visibility,
                max_members: defaultMaxMembers ? parseInt(defaultMaxMembers) : 20,
                default_day: defaultDay || null,
                default_time_start: defaultTimeStart || null,
                logo_url: logoUrl,
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
            router.push(`/dashboard/grupos/${group.id}`);
            router.refresh();

        } catch (err: any) {
            console.error("Error creating group:", JSON.stringify(err, null, 2));
            console.error("Error details:", err);
            setError(err.message || err.details || "Erro ao criar grupo.");
        } finally {
            setLoading(false);
        }
    };

    // Helper for Day Labels
    const getDayLabel = (day: string) => {
        const days: Record<string, string> = {
            domingo: "Dom", segunda: "Seg", terca: "Ter", quarta: "Qua",
            quinta: "Qui", sexta: "Sex", sabado: "Sáb"
        };
        return days[day] || day.substring(0, 3);
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            setUploadingLogo(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `group-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage (using 'group-logos' bucket)
            const { error: uploadError } = await supabase.storage
                .from('group-logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('group-logos').getPublicUrl(filePath);
            setLogoUrl(publicUrl);

        } catch (error: any) {
            console.error("Error uploading logo:", error);
            setError("Erro ao fazer upload da imagem. Verifique se o bucket 'group-logos' existe.");
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] p-4 lg:p-10 min-h-screen">
            <div className="mx-auto flex max-w-[960px] flex-col gap-8">
                {/* Page Header & Progress */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-[#0d1b12] dark:text-white">Criar Novo Grupo</h2>
                            <p className="mt-1 text-[#4c9a66] dark:text-gray-400">Configure sua nova pelada em poucos passos</p>
                        </div>
                        {/* Stepper Indicators */}
                        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#13ec5b] text-[#0d1b12] shadow-md shadow-[#13ec5b]/20">1</span>
                            <span className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-transparent dark:text-gray-600">2</span>
                            <span className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-transparent dark:text-gray-600">3</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Main Form Container */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Form Steps */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">

                        {/* Step 1 Card: Basic Info */}
                        <div className="rounded-xl border border-[#e7f3eb] bg-white p-6 shadow-sm dark:border-[#2a4533] dark:bg-[#1a3322]">
                            <div className="mb-6 flex items-center gap-3 border-b border-[#e7f3eb] pb-4 dark:border-[#2a4533]">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f3eb] text-[#0d1b12] dark:bg-[#2a4533] dark:text-white">
                                    <span className="material-symbols-outlined text-lg">info</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white">Informações da Pelada</h3> {/* Updated text */}
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col-reverse gap-6 sm:flex-row">
                                    {/* Logo Upload */}
                                    <div className="flex flex-col gap-2 sm:w-1/3">
                                        <label className="text-sm font-medium text-[#0d1b12] dark:text-white">Escudo do Time</label>
                                        <div className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-[#cfe7d7] bg-[#f8fcf9] hover:border-[#13ec5b] hover:bg-[#f0fdf4] dark:border-gray-600 dark:bg-[#1a3322] dark:hover:border-[#13ec5b] dark:hover:bg-[#1a3322] transition-all overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform dark:bg-[#2a4533]">
                                                        {uploadingLogo ? (
                                                            <span className="size-5 border-2 border-[#13ec5b] border-t-transparent rounded-full animate-spin"></span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-[#4c9a66] group-hover:text-[#13ec5b] dark:text-gray-400">add_a_photo</span>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-center text-xs text-[#4c9a66] dark:text-gray-400">{uploadingLogo ? "Enviando..." : "Clique para upload"}</p>
                                                </>
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
                                    {/* Text Inputs */}
                                    <div className="flex flex-1 flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-[#0d1b12] dark:text-white">Nome da Pelada</label> {/* Updated text */}
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-12 w-full rounded-xl border border-[#cfe7d7] bg-white px-4 text-base outline-none focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] dark:text-white dark:placeholder-gray-500"
                                                placeholder="Ex: Futebol de Quinta" // Updated text
                                                type="text"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 h-full">
                                            <label className="text-sm font-medium text-[#0d1b12] dark:text-white">Resenha (Descrição)</label> {/* Updated text */}
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="h-full min-h-[120px] w-full resize-none rounded-xl border border-[#cfe7d7] bg-white px-4 py-3 text-base outline-none focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] dark:text-white dark:placeholder-gray-500"
                                                placeholder="Regras, horários, nível da galera..." // Updated text
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 Card: Location & Time */}
                        <div className="rounded-xl border border-[#e7f3eb] bg-white p-6 shadow-sm dark:border-[#2a4533] dark:bg-[#1a3322]">
                            <div className="mb-6 flex items-center gap-3 border-b border-[#e7f3eb] pb-4 dark:border-[#2a4533]">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f3eb] text-[#0d1b12] dark:bg-[#2a4533] dark:text-white">
                                    <span className="material-symbols-outlined text-lg">location_on</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white">Local e Frequência</h3>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-[#0d1b12] dark:text-white">Cidade/Bairro</label>
                                        <div className="relative">
                                            <input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="h-12 w-full rounded-xl border border-[#cfe7d7] bg-white pl-10 pr-4 text-base outline-none focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] dark:text-white dark:placeholder-gray-500"
                                                placeholder="Ex: Copacabana, RJ"
                                                type="text"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-3 text-[#4c9a66] dark:text-gray-500">map</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-[#0d1b12] dark:text-white">Horário Padrão</label>
                                        <div className="relative">
                                            <input
                                                value={defaultTimeStart}
                                                onChange={(e) => setDefaultTimeStart(e.target.value)}
                                                className="h-12 w-full rounded-xl border border-[#cfe7d7] bg-white pl-10 pr-4 text-base outline-none focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                                type="time"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-3 text-[#4c9a66] dark:text-gray-500">schedule</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-medium text-[#0d1b12] dark:text-white">Dia da Semana</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: "domingo", label: "Dom" },
                                            { id: "segunda", label: "Seg" },
                                            { id: "terca", label: "Ter" },
                                            { id: "quarta", label: "Qua" },
                                            { id: "quinta", label: "Qui" },
                                            { id: "sexta", label: "Sex" },
                                            { id: "sabado", label: "Sáb" },
                                        ].map((day) => (
                                            <div key={day.id} className="flex-1 min-w-[40px]">
                                                <input
                                                    id={day.id}
                                                    name="weekday"
                                                    type="radio"
                                                    className="peer hidden"
                                                    checked={defaultDay === day.id}
                                                    onChange={() => setDefaultDay(day.id)}
                                                />
                                                <label
                                                    htmlFor={day.id}
                                                    className="flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-[#cfe7d7] bg-white text-sm text-[#4c9a66] hover:border-[#13ec5b] hover:text-[#13ec5b] transition-colors dark:border-gray-600 dark:bg-[#1a3322] dark:text-gray-400 peer-checked:bg-[#13ec5b] peer-checked:text-[#0d1b12] peer-checked:border-[#13ec5b] peer-checked:font-semibold"
                                                >
                                                    {day.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 Card: Privacy */}
                        <div className="rounded-xl border border-[#e7f3eb] bg-white p-6 shadow-sm dark:border-[#2a4533] dark:bg-[#1a3322]">
                            <div className="mb-6 flex items-center gap-3 border-b border-[#e7f3eb] pb-4 dark:border-[#2a4533]">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f3eb] text-[#0d1b12] dark:bg-[#2a4533] dark:text-white">
                                    <span className="material-symbols-outlined text-lg">lock</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#0d1b12] dark:text-white">Privacidade</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Public Option */}
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="privacy"
                                        className="peer sr-only"
                                        checked={visibility === "public"}
                                        onChange={() => setVisibility("public")}
                                    />
                                    <div className="custom-radio-card flex h-full flex-col gap-3 rounded-xl border border-[#cfe7d7] bg-white p-4 transition-all hover:border-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] peer-checked:border-[#13ec5b] peer-checked:bg-[#f0fdf4] dark:peer-checked:bg-[#1f3b29]">
                                        <div className="flex items-center justify-between">
                                            <div className="rounded-full bg-[#e7f3eb] p-2 text-[#0d1b12] dark:bg-[#2a4533] dark:text-white">
                                                <span className={`material-symbols-outlined icon-active ${visibility === 'public' ? 'text-[#13ec5b]' : ''}`}>public</span>
                                            </div>
                                            <div className={`h-5 w-5 rounded-full border-2 ${visibility === 'public' ? 'border-[#13ec5b] bg-[#13ec5b]' : 'border-gray-300 dark:border-gray-500'}`}></div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0d1b12] dark:text-white">Público</p>
                                            <p className="text-xs text-[#4c9a66] dark:text-gray-400">Qualquer pessoa pode encontrar o grupo.</p>
                                        </div>
                                    </div>
                                </label>
                                {/* Private Option */}
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="privacy"
                                        className="peer sr-only"
                                        checked={visibility === "private"}
                                        onChange={() => setVisibility("private")}
                                    />
                                    <div className="custom-radio-card flex h-full flex-col gap-3 rounded-xl border border-[#cfe7d7] bg-white p-4 transition-all hover:border-[#13ec5b] dark:border-gray-600 dark:bg-[#1a3322] peer-checked:border-[#13ec5b] peer-checked:bg-[#f0fdf4] dark:peer-checked:bg-[#1f3b29]">
                                        <div className="flex items-center justify-between">
                                            <div className="rounded-full bg-[#e7f3eb] p-2 text-[#0d1b12] dark:bg-[#2a4533] dark:text-white">
                                                <span className={`material-symbols-outlined icon-active ${visibility === 'private' ? 'text-[#13ec5b]' : ''}`}>lock</span>
                                            </div>
                                            <div className={`h-5 w-5 rounded-full border-2 ${visibility === 'private' ? 'border-[#13ec5b] bg-[#13ec5b]' : 'border-gray-300 dark:border-gray-500'}`}></div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0d1b12] dark:text-white">Privado</p>
                                            <p className="text-xs text-[#4c9a66] dark:text-gray-400">Apenas convidados entram.</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview & Summary */}
                    <div className="col-span-1 hidden lg:block">
                        <div className="sticky top-10 flex flex-col gap-6">
                            {/* Preview Card */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#13ec5b] to-[#0b8a35] p-6 text-white shadow-xl">
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider opacity-90">Preview do Card</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold truncate max-w-[180px]">{name || "Nome do Grupo"}</h3>
                                            <p className="text-sm opacity-90">{defaultMaxMembers || "?"} vagas disponíveis</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                                            <span className="material-symbols-outlined mr-1 text-[14px]">calendar_today</span>
                                            {getDayLabel(defaultDay) || "Dia"}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                                            <span className="material-symbols-outlined mr-1 text-[14px]">schedule</span>
                                            {defaultTimeStart || "Horário"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 rounded-xl border border-[#e7f3eb] bg-white p-6 dark:border-[#2a4533] dark:bg-[#1a3322]">
                                <button
                                    onClick={handleCreateGroup}
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#13ec5b] px-6 py-4 text-base font-bold text-[#0d1b12] shadow-lg shadow-[#13ec5b]/25 hover:bg-[#0fd650] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="w-6 h-6 border-2 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span>Criar Grupo</span>
                                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                                <Link
                                    href="/dashboard/grupos"
                                    className="flex items-center justify-center w-full rounded-full border border-transparent bg-transparent px-6 py-3 text-sm font-medium text-[#4c9a66] hover:bg-[#e7f3eb] dark:hover:bg-[#2a4533] transition-colors"
                                >
                                    Cancelar
                                </Link>
                            </div>

                            {/* Help Box */}
                            <div className="rounded-xl bg-[#e7f3eb] p-4 dark:bg-[#1a3322]">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[#4c9a66] dark:text-gray-400">help</span>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold text-[#0d1b12] dark:text-white">Precisa de ajuda?</p>
                                        <p className="text-xs text-[#4c9a66] dark:text-gray-400">Confira nosso guia de como organizar a pelada perfeita.</p>
                                        <a className="mt-1 text-xs font-medium text-[#13ec5b] hover:underline" href="#">Ler Guia</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Footer Actions */}
                    <div className="col-span-1 block pb-10 lg:hidden">
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCreateGroup}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#13ec5b] px-6 py-4 text-base font-bold text-[#0d1b12] shadow-lg shadow-[#13ec5b]/25 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Criando..." : "Criar Grupo"}
                            </button>
                            <Link href="/dashboard/grupos" className="flex items-center justify-center w-full rounded-full px-6 py-3 text-sm font-medium text-[#4c9a66]">
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
