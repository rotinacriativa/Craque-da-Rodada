"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import ConfirmationModal from "../../components/ConfirmationModal";

interface IBGEUF {
    id: number;
    sigla: string;
    nome: string;
}

interface IBGECity {
    id: number;
    nome: string;
}

export default function UserProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [age, setAge] = useState<number | null>(null);
    const [maritalStatus, setMaritalStatus] = useState("Solteiro");
    const [hasChildren, setHasChildren] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    // Location State
    const [ufs, setUfs] = useState<IBGEUF[]>([]);
    const [state, setState] = useState(""); // sigla
    const [cities, setCities] = useState<IBGECity[]>([]);
    const [city, setCity] = useState("");

    // Player Stats
    const [position, setPosition] = useState("Meio");
    const [dominantFoot, setDominantFoot] = useState("Direito");
    const [jerseyNumber, setJerseyNumber] = useState("");
    const [skillLevel, setSkillLevel] = useState("Amador");

    // Delete Account State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch IBGE Data
    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => setUfs(data))
            .catch(err => console.error("Error fetching UFs:", err));
    }, []);

    useEffect(() => {
        if (state) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
                .then(res => res.json())
                .then(data => setCities(data))
                .catch(err => console.error("Error fetching cities:", err));
        } else {
            setCities([]);
        }
    }, [state]);

    // Calculate Age
    useEffect(() => {
        if (birthDate) {
            const birth = new Date(birthDate);
            const today = new Date();
            let ageVal = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                ageVal--;
            }
            setAge(ageVal);
        }
    }, [birthDate]);

    // Fetch Profile
    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }
                setUserId(user.id);
                setEmail(user.email || "");
                setEmailVerified(!!user.email_confirmed_at);

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching profile details:", error);
                }

                if (data) {
                    setFullName(data.full_name || "");
                    setAvatarUrl(data.avatar_url);
                    setBio(data.bio || "");
                    setPhone(data.phone || "");
                    setBirthDate(data.birth_date || "");
                    setMaritalStatus(data.marital_status || "Solteiro");
                    setHasChildren(data.has_children || false);
                    setState(data.state || "");
                    setCity(data.city || "");
                    setPosition(data.position || "Meio");
                    setDominantFoot(data.dominant_foot || "Direito");
                    setJerseyNumber(data.jersey_number || "");
                    setSkillLevel(data.skill_level || "Amador");
                } else {
                    // Init from meta if available
                    setFullName(user.user_metadata?.full_name || "");
                }

            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [router]);

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        setMessage(null);

        try {
            const updates = {
                id: userId,
                full_name: fullName,
                avatar_url: avatarUrl,
                bio,
                phone,
                birth_date: birthDate,
                marital_status: maritalStatus,
                has_children: hasChildren,
                state,
                city,
                position,
                dominant_foot: dominantFoot,
                jersey_number: jerseyNumber,
                skill_level: skillLevel,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            setMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });

            // Allow parent components to react if needed (e.g. sidebar avatar) by trigger or context in future
            router.refresh();

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: "Erro ao salvar perfil." });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setSaving(true);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(publicUrl);

            // Auto save reference
            if (userId) {
                await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() });
                router.refresh();
            }
            setMessage({ type: 'success', text: "Foto atualizada!" });

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: "Erro ao fazer upload da foto." });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // Get current session token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session found");

            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete account');
            }

            // Success: Clear local session and redirect
            await supabase.auth.signOut();
            router.push('/');
            // Force reload to ensure all states are cleared
            window.location.href = '/';
        } catch (error: any) {
            console.error("Error deleting account:", error);
            setMessage({ type: 'error', text: "Erro ao excluir conta: " + error.message });
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#13ec5b] animate-spin">progress_activity</span>
                    <p className="text-[#4c9a66]">Carregando seu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1b12] dark:text-white">Meu Perfil</h1>
                    <p className="text-[#4c9a66] mt-1">Gerencie sua identidade de craque e estatísticas.</p>
                </div>
                <div className="flex gap-3 items-center">
                    {message && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="material-symbols-outlined text-lg">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                            {message.text}
                        </div>
                    )}
                    <button onClick={handleSave} disabled={saving} className={`px-6 py-2.5 rounded-full bg-[#13ec5b] hover:bg-[#0eb545] text-[#0d1b12] font-bold text-sm shadow-lg shadow-[#13ec5b]/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Avatar & Bio */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Avatar Card */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#13ec5b]/20 to-transparent"></div>
                        <div className="relative flex flex-col items-center">
                            <div className="relative mb-4 group-hover:scale-105 transition-transform">
                                <div className="size-32 rounded-full border-4 border-white dark:border-[#1a2e22] shadow-md bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url('${avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuB3vt9JQw3REUMc3ih_xWDe-F6VKiXrMCAGPIhj4e9ra_bDGcwiVf7OxA2h6_FXedMT77YDVGJJGTBRfD6Kf0WEG45K41ENoWNGa7MOqAa3YHxkXtpSoZ-QSPJB0BU5U5SSyZJ_13xwBC5uS3PrHNoOnVhJXFDJu_Xtd2kv0Tk7wTwRDnQ6LLZxeO12-_ZQXRXoc-Ik6ck8yUSqOubRqzWXKl_He7aZAu6aUTzyjUZ39NroZW0od4wgYhK81XigTzv__kekDBnJNu4"}')` }}></div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-[#0d1b12] text-white rounded-full hover:bg-[#13ec5b] hover:text-[#0d1b12] transition-colors shadow-lg border-2 border-white dark:border-[#1a2e22] cursor-pointer" title="Alterar foto">
                                    <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-center text-[#0d1b12] dark:text-white">{fullName || "Nome do Jogador"}</h2>
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
                                <div className="text-center"><p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">Jogos</p><p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p></div>
                                <div className="text-center border-l border-r border-[#e7f3eb] dark:border-[#2a4032]"><p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">Gols</p><p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p></div>
                                <div className="text-center"><p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">MVPs</p><p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#13ec5b]">person</span>
                            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Sobre Mim</h3>
                        </div>
                        <label className="block">
                            <textarea className="w-full min-h-[120px] rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] p-3 text-sm focus:ring-2 focus:ring-[#13ec5b] focus:border-[#13ec5b] resize-none transition-all placeholder:text-[#4c9a66]/50 text-[#0d1b12] dark:text-white focus:outline-none" placeholder="Conte um pouco sobre seu estilo de jogo..." value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                        </label>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined">warning</span>
                            Zona de Perigo
                        </h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                            Encerrar sua carreira no app? A exclusão é permanente e apaga todos os seus dados, grupos e histórico.
                        </p>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full py-3 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">delete_forever</span>
                            Excluir Minha Conta
                        </button>
                    </div>
                </div>

                {/* Right Column: Extended Personal Info & Player Stats */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* 1. Informações Pessoais (Expanded) */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#0d1b12] dark:text-white">
                            <span className="material-symbols-outlined text-[#13ec5b]">badge</span>
                            Informações Pessoais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Nome Completo</span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Estado</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                                    value={state}
                                    onChange={(e) => { setState(e.target.value); setCity(""); }}
                                >
                                    <option value="">Selecione</option>
                                    {ufs.map(uf => (
                                        <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Cidade</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    disabled={!state}
                                >
                                    <option value="">{state ? "Selecione" : "Selecione o Estado"}</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Celular (Whatsapp)</span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66] flex justify-between">
                                    Data de Nascimento
                                    {age && <span className="text-[#13ec5b] font-bold">{age} anos</span>}
                                </span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Estado Civil</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                                    value={maritalStatus}
                                    onChange={(e) => setMaritalStatus(e.target.value)}
                                >
                                    <option value="Solteiro">Solteiro(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Separado">Separado(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viúvo">Viúvo(a)</option>
                                </select>
                            </label>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Tem filhos?</span>
                                <div className="flex gap-4 items-center h-12">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={hasChildren} onChange={() => setHasChildren(true)} className="accent-[#13ec5b] size-5" />
                                        <span className="text-[#0d1b12] dark:text-white font-medium">Sim</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={!hasChildren} onChange={() => { setHasChildren(false); }} className="accent-[#13ec5b] size-5" />
                                        <span className="text-[#0d1b12] dark:text-white font-medium">Não</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Ficha do Jogador */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-[#0d1b12] dark:text-white">
                                <span className="material-symbols-outlined text-[#13ec5b]">sports_soccer</span>
                                Ficha do Jogador
                            </h3>
                            <span className="bg-[#13ec5b]/10 text-[#0eb545] dark:text-[#13ec5b] text-xs font-bold px-3 py-1 rounded-full uppercase">Editável</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-medium text-[#4c9a66]">Posição Preferida</span>
                                <div className="flex flex-wrap gap-2">
                                    {['Goleiro', 'Defesa', 'Meio', 'Ataque'].map(pos => (
                                        <button key={pos} onClick={() => setPosition(pos)} className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${position === pos ? 'bg-[#13ec5b] text-[#0d1b12] border-[#13ec5b] shadow-md font-bold' : 'border-[#e7f3eb] dark:border-[#2a4032] opacity-70 hover:opacity-100 hover:border-[#13ec5b] text-[#0d1b12] dark:text-white'}`}>{pos}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-medium text-[#4c9a66]">Pé Dominante</span>
                                <div className="flex bg-[#f6f8f6] dark:bg-[#102216] p-1 rounded-lg border border-[#e7f3eb] dark:border-[#2a4032]">
                                    {['Esquerdo', 'Direito', 'Ambos'].map(foot => (
                                        <button key={foot} onClick={() => setDominantFoot(foot)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${dominantFoot === foot ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm font-bold' : 'text-[#4c9a66] hover:text-[#0d1b12] dark:hover:text-white'}`}>{foot}</button>
                                    ))}
                                </div>
                            </div>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Camisa Favorita</span>
                                <div className="relative">
                                    <input className="w-full h-12 pl-4 pr-12 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-black text-lg text-[#0d1b12] dark:text-white" type="number" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#4c9a66]">checkroom</span>
                                </div>
                            </label>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-[#4c9a66]">Nível Técnico</span>
                                    <span className="text-xs font-bold text-[#13ec5b] bg-[#13ec5b]/10 px-2 py-0.5 rounded">{skillLevel || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032]">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setSkillLevel(star === 1 ? 'Iniciante' : star === 2 ? 'Amador' : star === 3 ? 'Intermediário' : star === 4 ? 'Avançado' : 'Craque')} className="text-[#13ec5b] hover:scale-110 transition-transform cursor-pointer">
                                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `'FILL' ${['Iniciante', 'Amador', 'Intermediário', 'Avançado', 'Craque'].indexOf(skillLevel) >= star - 1 ? 1 : 0}` }}>star</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Excluir Conta Permanentemente"
                message="Tem certeza absoluta? Essa ação não pode ser desfeita. Todos os seus grupos, partidas e mensagens serão apagados."
                confirmText="Sim, Excluir Minha Conta"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
