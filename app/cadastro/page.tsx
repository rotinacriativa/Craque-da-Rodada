"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lexend, Noto_Sans } from "next/font/google";
import { useState } from "react";
import { supabase } from "../../src/lib/client";

const lexend = Lexend({ subsets: ["latin"] });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function Cadastro() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setErrorMessage("As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                setErrorMessage("Erro ao criar conta: " + error.message);
                setLoading(false);
            } else {
                // Attempt Auto-Login
                try {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (signInData.session) {
                        // Login Successful - Redirect to Dashboard
                        router.push("/dashboard");
                    } else {
                        // Email confirmation may be required
                        setSuccessMessage("Cadastro realizado! Verifique seu email para confirmar e fazer login.");
                        setLoading(false);
                    }
                } catch (loginErr) {
                    // Fallback if auto-login fails for any reason
                    setSuccessMessage("Cadastro realizado! Faça login para continuar.");
                    setLoading(false);
                }
            }
        } catch (error) {
            setErrorMessage("Ocorreu um erro inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className={`${lexend.className} bg-[#f6f8f6] dark:bg-[#102216] text-[#0d1b12] dark:text-white antialiased overflow-x-hidden transition-colors duration-300`}>
            {/* Material Symbols Font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

            <div className="min-h-screen w-full flex">
                {/* Left Column: Form Section */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 xl:px-24 py-12 relative z-10 bg-[#f6f8f6] dark:bg-[#102216]">
                    {/* Logo Header */}
                    {/* Logo Header */}
                    <Link href="/" className="absolute top-8 left-6 sm:left-12 xl:left-24 flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="size-10 flex items-center justify-center rounded-full bg-[#13ec5b]/20 text-[#0eb345] dark:text-[#13ec5b]">
                            <span className="material-symbols-outlined text-2xl">sports_soccer</span>
                        </div>
                        <h2 className="text-[#0d1b12] dark:text-white text-xl font-bold tracking-tight">Craque da Rodada</h2>
                    </Link>
                    {/* Main Content Container */}
                    <div className="w-full max-w-md flex flex-col gap-8 mt-16 lg:mt-0">
                        {/* Page Heading */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#0d1b12] dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.03em]">
                                Entre pro jogo
                            </h1>
                            <p className="text-[#4c9a66] dark:text-gray-400 text-lg font-normal">
                                Organize suas peladas em segundos.
                            </p>
                        </div>
                        {/* Registration Form */}
                        <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
                            {errorMessage && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                    {errorMessage}
                                </div>
                            )}
                            {successMessage && (
                                <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded-lg">
                                    {successMessage}
                                </div>
                            )}
                            {/* Full Name Field */}
                            <label className="flex flex-col gap-2">
                                <span className="text-[#0d1b12] dark:text-gray-200 text-sm font-semibold pl-4">Nome completo</span>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#4c9a66] group-focus-within:text-[#13ec5b] transition-colors">person</span>
                                    <input
                                        className={`w-full rounded-lg border-2 border-[#cfe7d7] dark:border-[#1a3325] bg-white dark:bg-[#1a3325] text-[#0d1b12] dark:text-white h-14 pl-14 pr-5 placeholder:text-[#4c9a66]/70 focus:outline-none focus:border-[#13ec5b] focus:ring-0 transition-all disabled:opacity-50 ${notoSans.className}`}
                                        placeholder="Ex: João Silva"
                                        required
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </label>
                            {/* Email Field */}
                            <label className="flex flex-col gap-2">
                                <span className="text-[#0d1b12] dark:text-gray-200 text-sm font-semibold pl-4">Email</span>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#4c9a66] group-focus-within:text-[#13ec5b] transition-colors">mail</span>
                                    <input
                                        className={`w-full rounded-lg border-2 border-[#cfe7d7] dark:border-[#1a3325] bg-white dark:bg-[#1a3325] text-[#0d1b12] dark:text-white h-14 pl-14 pr-5 placeholder:text-[#4c9a66]/70 focus:outline-none focus:border-[#13ec5b] focus:ring-0 transition-all disabled:opacity-50 ${notoSans.className}`}
                                        placeholder="Ex: joao@email.com"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </label>
                            {/* Passwords Row */}
                            <div className="flex flex-col md:flex-row gap-5">
                                <label className="flex flex-col gap-2 flex-1">
                                    <span className="text-[#0d1b12] dark:text-gray-200 text-sm font-semibold pl-4">Senha</span>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#4c9a66] group-focus-within:text-[#13ec5b] transition-colors">lock</span>
                                        <input
                                            className={`w-full rounded-lg border-2 border-[#cfe7d7] dark:border-[#1a3325] bg-white dark:bg-[#1a3325] text-[#0d1b12] dark:text-white h-14 pl-14 pr-5 placeholder:text-[#4c9a66]/70 focus:outline-none focus:border-[#13ec5b] focus:ring-0 transition-all disabled:opacity-50 ${notoSans.className}`}
                                            placeholder="••••••••"
                                            required
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2 flex-1">
                                    <span className="text-[#0d1b12] dark:text-gray-200 text-sm font-semibold pl-4">Confirmar</span>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#4c9a66] group-focus-within:text-[#13ec5b] transition-colors">lock_reset</span>
                                        <input
                                            className={`w-full rounded-lg border-2 border-[#cfe7d7] dark:border-[#1a3325] bg-white dark:bg-[#1a3325] text-[#0d1b12] dark:text-white h-14 pl-14 pr-5 placeholder:text-[#4c9a66]/70 focus:outline-none focus:border-[#13ec5b] focus:ring-0 transition-all disabled:opacity-50 ${notoSans.className}`}
                                            placeholder="••••••••"
                                            required
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </label>
                            </div>
                            {/* Submit Button */}
                            <button
                                className={`mt-4 w-full h-14 bg-[#13ec5b] hover:bg-[#0eb345] text-[#0d1b12] font-bold text-lg rounded-lg shadow-lg shadow-[#13ec5b]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="w-6 h-6 border-2 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span>Criar conta</span>
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>
                        {/* Footer Links */}
                        <div className="flex flex-col items-center gap-4 text-center">
                            <p className="text-[#4c9a66] dark:text-gray-400 text-sm">
                                Ao se cadastrar, você concorda com nossos <Link className="underline hover:text-[#13ec5b] transition-colors" href="#">Termos</Link> e <Link className="underline hover:text-[#13ec5b] transition-colors" href="#">Política de Privacidade</Link>.
                            </p>
                            <div className="w-full h-px bg-[#cfe7d7] dark:bg-[#1a3325]"></div>
                            <p className="text-[#0d1b12] dark:text-white text-base font-medium">
                                Já tem uma conta? <Link className="text-[#13ec5b] hover:text-[#0eb345] dark:hover:text-green-300 font-bold ml-1 hover:underline" href="/login">Faça login</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals */}
                <div className="hidden lg:flex w-1/2 relative bg-[#1a3325] overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Jogadores de futebol amador comemorando um gol em um campo gramado sob luz solar"
                            className="w-full h-full object-cover opacity-80"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-qjlwTLH3_rxBy7RF2YSEoinoYGeTthgqef38xfOQ-Z2DgqrL4XxETNDHv2v-LaNvLx8_6BLzi_N874GDdZvUDpiTZDXZ3AbHzp6jtD9zNvCQ709YslZMjmAiOusFwMtrFh-XNMYf04WNUr9t0aw0_4GJFwjK3KfjWhasb6mwVpHuPcUU7eGlM2qStNRkJX9SFe9itEFQstqu6BXWMTg4I_ECvM5EGgdMGddNQrhzscklzDmQztnnSoKVbuK4WjPcI8AZunGPZk8"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#102216] via-[#102216]/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-[#13ec5b]/10 mix-blend-overlay"></div>
                    </div>
                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col justify-end p-16 xl:p-24 w-full">
                        <div className="bg-[#102216]/30 backdrop-blur-md border border-white/10 p-8 rounded-lg">
                            <div className="flex gap-1 mb-4">
                                <span className="material-symbols-outlined text-[#13ec5b] text-xl">star</span>
                                <span className="material-symbols-outlined text-[#13ec5b] text-xl">star</span>
                                <span className="material-symbols-outlined text-[#13ec5b] text-xl">star</span>
                                <span className="material-symbols-outlined text-[#13ec5b] text-xl">star</span>
                                <span className="material-symbols-outlined text-[#13ec5b] text-xl">star</span>
                            </div>
                            <blockquote className="text-white text-2xl font-bold leading-relaxed mb-4">
                                &quot;Nunca foi tão fácil juntar a galera. O Craque da Rodada acabou com a dor de cabeça de organizar lista e pagamentos.&quot;
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full overflow-hidden border-2 border-[#13ec5b]">
                                    <img alt="User avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA13BOBohHktRuKtTTK9QDf9g7TFx76rva81mLUKXn9aBp8wD_dFvA2NZozqqIDnUUNbNXudumoSecUAQojggzLxfDMviQ6ZEAufuEPLHpMMjQSKON-3W8ORBKFOzJti9RkWlCIN4zVBNd9634kt64VSJkfCYIs-LPhvyh6jKbajyLnCjYZVmFVw9HMldDIZiSNqsel27_8m2bceQmQMwqB7XvV6J9yb60t54RRVL-GMKWa6nM-1RVU3MkXIKSOpkaD_w8DETHVZIw" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Carlos Eduardo</p>
                                    <p className="text-white/60 text-sm">Organizador há 3 anos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
