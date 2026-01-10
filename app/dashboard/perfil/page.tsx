"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/client";
import { getResilientUser } from "../../../src/lib/auth-helpers";
import ConfirmationModal from "../../components/ConfirmationModal";
import { ProfileHeader } from "../../components/player/profile/ProfileHeader";
import { BioSection } from "../../components/player/profile/BioSection";
import { PersonalInfoForm } from "../../components/player/profile/PersonalInfoForm";
import { PlayerStatsForm } from "../../components/player/profile/PlayerStatsForm";
import { DangerZone } from "../../components/player/profile/DangerZone";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";

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
    const [state, setState] = useState("");
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
                const user = await getResilientUser(supabase);
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

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(publicUrl);

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

            await supabase.auth.signOut();
            router.push('/');
            window.location.href = '/';
        } catch (error: any) {
            console.error("Error deleting account:", error);
            setMessage({ type: 'error', text: "Erro ao excluir conta: " + error.message });
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="lg" message="Carregando seu perfil..." fullScreen />;
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
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-2.5 rounded-full bg-[#13ec5b] hover:bg-[#0eb545] text-[#0d1b12] font-bold text-sm shadow-lg shadow-[#13ec5b]/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Avatar & Bio */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <ProfileHeader
                        fullName={fullName}
                        email={email}
                        avatarUrl={avatarUrl}
                        emailVerified={emailVerified}
                        onAvatarUpload={handleAvatarUpload}
                    />

                    <BioSection bio={bio} onBioChange={setBio} />

                    <DangerZone onDeleteAccount={() => setIsDeleteModalOpen(true)} />
                </div>

                {/* Right Column: Extended Personal Info & Player Stats */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <PersonalInfoForm
                        fullName={fullName}
                        state={state}
                        city={city}
                        phone={phone}
                        birthDate={birthDate}
                        age={age}
                        maritalStatus={maritalStatus}
                        hasChildren={hasChildren}
                        ufs={ufs}
                        cities={cities}
                        onFullNameChange={setFullName}
                        onStateChange={setState}
                        onCityChange={setCity}
                        onPhoneChange={setPhone}
                        onBirthDateChange={setBirthDate}
                        onMaritalStatusChange={setMaritalStatus}
                        onHasChildrenChange={setHasChildren}
                    />

                    <PlayerStatsForm
                        position={position}
                        dominantFoot={dominantFoot}
                        jerseyNumber={jerseyNumber}
                        skillLevel={skillLevel}
                        onPositionChange={setPosition}
                        onDominantFootChange={setDominantFoot}
                        onJerseyNumberChange={setJerseyNumber}
                        onSkillLevelChange={setSkillLevel}
                    />
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
