"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lexend, Noto_Sans } from "next/font/google";

const lexend = Lexend({ subsets: ["latin"] });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function RecuperarSenha() {
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setEmailSent(false);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setEmailSent(true);
        }, 1500);
    };

    return (
        <div className={`${lexend.className} bg-[#f8fcf9] dark:bg-[#0a140f] min-h-screen flex flex-col font-sans text-[#0d1b12] dark:text-[#f0fdf4] transition-colors duration-300`}>
            {/* Material Symbols Font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

            {/* Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0" style={{ backgroundImage: "linear-gradient(to right, #13ec5b15 1px, transparent 1px), linear-gradient(to bottom, #13ec5b15 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}></div>

            {/* Top Navigation */}
            <header className="relative z-10 w-full border-b border-[#e7f3eb] dark:border-white/10 backdrop-blur-sm bg-white/70 dark:bg-[#0a140f]/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="text-[#13ec5b] flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                            </div>
                            <h2 className="text-[#0d1b12] dark:text-white text-xl font-bold tracking-tight">Craque da Rodada</h2>
                        </div>
                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <nav className="flex gap-6">
                                <Link className="text-sm font-medium hover:text-[#13ec5b] transition-colors text-[#0d1b12] dark:text-gray-300" href="/">Home</Link>
                                <Link className="text-sm font-medium hover:text-[#13ec5b] transition-colors text-[#0d1b12] dark:text-gray-300" href="#">Recursos</Link>
                                <Link className="text-sm font-medium hover:text-[#13ec5b] transition-colors text-[#0d1b12] dark:text-gray-300" href="#">Preços</Link>
                            </nav>
                            <div className="flex items-center gap-4">
                                <Link className="text-sm font-medium hover:text-[#13ec5b] transition-colors text-[#0d1b12] dark:text-gray-300" href="/login">Login</Link>
                                <Link href="/cadastro" className="bg-[#13ec5b] hover:bg-[#0fb946] text-[#0d1b12] font-bold text-sm px-5 py-2.5 rounded-full transition-all shadow-lg shadow-[#13ec5b]/20 hover:shadow-[#13ec5b]/40 active:scale-95">
                                    Criar conta
                                </Link>
                            </div>
                        </div>
                        {/* Mobile Menu Icon */}
                        <button className="md:hidden p-2 text-[#0d1b12] dark:text-white">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[480px]">
                    {/* Card Container */}
                    <div className="bg-white dark:bg-[#11221a] rounded-xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-white/5 overflow-hidden">
                        {/* Card Header Image/Illustration area (Subtle) */}
                        <div className="relative h-2 bg-gradient-to-r from-transparent via-[#13ec5b] to-transparent opacity-50"></div>
                        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                            {/* Icon Badge */}
                            <div className="w-16 h-16 rounded-full bg-[#13ec5b]/10 flex items-center justify-center mb-6 text-[#13ec5b] animate-bounce-slow">
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lock_reset</span>
                            </div>
                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d1b12] dark:text-white mb-3">Recuperar Senha</h1>

                            {/* Description or Success Message */}
                            {!emailSent ? (
                                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
                                    Esqueceu sua senha? Não se preocupe. Digite seu email abaixo e enviaremos um link para redefinir seu acesso.
                                </p>
                            ) : (
                                <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-green-700 dark:text-green-400 font-bold mb-1">Email enviado!</p>
                                    <p className="text-sm text-green-600 dark:text-green-500">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
                                </div>
                            )}

                            {/* Form */}
                            {!emailSent && (
                                <form className="w-full space-y-6" onSubmit={handleSubmit}>
                                    {/* Email Input */}
                                    <div className="text-left group">
                                        <label className="block text-sm font-medium text-[#0d1b12] dark:text-gray-300 mb-2 ml-1" htmlFor="email">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#13ec5b] transition-colors">
                                                <span className="material-symbols-outlined">mail</span>
                                            </div>
                                            <input
                                                className={`block w-full pl-11 pr-4 py-3.5 bg-[#f8fcf9] dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg text-[#0d1b12] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] transition-all sm:text-sm ${notoSans.className}`}
                                                id="email"
                                                placeholder="seu@email.com"
                                                required
                                                type="email"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    {/* Action Button */}
                                    <button
                                        disabled={loading}
                                        className="w-full flex items-center justify-center bg-[#13ec5b] hover:bg-[#0fb946] text-[#0d1b12] font-bold text-base py-3.5 rounded-full transition-all shadow-lg shadow-[#13ec5b]/25 hover:shadow-[#13ec5b]/40 active:scale-[0.98] group disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-6 h-6 border-2 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <span>Enviar link de recuperação</span>
                                                <span className="material-symbols-outlined ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Footer Link */}
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 w-full">
                                <Link className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0d1b12] dark:text-gray-400 dark:hover:text-white transition-colors gap-2 group" href="/login">
                                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                    Voltar para o Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
