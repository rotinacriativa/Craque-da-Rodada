"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lexend } from "next/font/google";
import { useState } from "react";
import { supabase } from "../../src/lib/client";

const lexend = Lexend({ subsets: ["latin"] });

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrorMessage("Erro ao entrar: " + error.message);
                setLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            setErrorMessage("Ocorreu um erro inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className={`${lexend.className} font-sans bg-[#f8fcf9] dark:bg-[#102216] text-[#0d1b12] dark:text-white min-h-screen flex flex-col`}>
            {/* Material Symbols Font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

            {/* Navbar */}
            <header className="flex items-center justify-between border-b border-solid border-[#e7f3eb] dark:border-[#2a4030] px-10 py-4 bg-white dark:bg-[#1c2e22]/50 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-4 text-[#0d1b12] dark:text-white hover:opacity-80 transition-opacity">
                    <div className="size-8 text-[#13ec5b]">
                        <span className="material-symbols-outlined text-4xl">sports_soccer</span>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Craque da Rodada</h2>
                </Link>
                <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
                    <div className="flex items-center gap-9">
                        <Link className="text-[#0d1b12] dark:text-[#cfe7d7] text-sm font-medium leading-normal hover:text-[#13ec5b] transition-colors" href="/ajuda">Ajuda</Link>
                    </div>
                    <Link
                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-transparent border border-[#e7f3eb] dark:border-[#2a4030] text-[#0d1b12] dark:text-[#cfe7d7] text-sm font-bold leading-normal hover:bg-[#e7f3eb] dark:hover:bg-[#2a4030] transition-colors"
                        href="/cadastro"
                    >
                        <span className="truncate">Criar Conta</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden">
                {/* Left Side: Image/Branding */}
                <div className="hidden md:flex w-1/2 relative bg-[#102216] items-center justify-center overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-10"></div>
                    <div className="absolute inset-0 bg-[#13ec5b]/10 mix-blend-overlay z-10"></div>
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqVSvDHpLf6XX8lJ7q4nzORpRe4p-CECpSj7j2VdXV8PyrrWJV-pRZu88sCL-T3J7W58ON9-39vflanjl-Wu7Qx4d0cRAOHCBcz-AcdMlrY1wEyCCl6Zsovv66liuFX_rhxpGocGswaVtF-Qx0D_YnvCp7Dk1C03p9jYGaJNa64YmehMCOcmpCq94v5AfxnaoNGDyFHTdroIos-XYT01t4EfnE1oA4D8wpvh7cre5mvO39hoyUs7WGwqJovcaqFsLTbJNzptO6hRg')" }}
                    >
                    </div>
                    <div className="relative z-20 max-w-lg px-12 text-center text-white">
                        <div className="mb-6 flex justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/10">
                                <span className="material-symbols-outlined text-5xl text-[#13ec5b]">trophy</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">Organize sua pelada como um profissional</h1>
                        <p className="text-lg text-white/80 font-light">Gerencie times, pagamentos e estatísticas em um só lugar. O fim da planilha do Excel chegou.</p>
                        <div className="mt-12 flex gap-4 justify-center">
                            <div className="flex -space-x-3">
                                <img alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_TvKkgZ2CWQr1NECdvatRLPJf6wg8b4g3Xmj7yX7jcSa6IERnKwTxupslClVJNlS19mHIzM-XXwgycRkdJ01BmYTG4qy-d3PgenxqEe5EflELzaY7DuRM0PkbV6dYkZZwJE32YbbDt5MLwCTG0REKF66-V3HKKn_RNkBToTsAmvYhZzaxmKkgQC_Ubjtp6vk_3g1HWWMxVUZEEnwcNyOGgm0AhJUtYMei8EuSC2eVO66JyvL4uIH1xiZo_MbJY-zv1c3-p85TG3U" />
                                <img alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsQnh8n_mmoKHgF2tqVXUc8fLXzIYk9eB8YRKCex3PuMNtmT7bg_s4FmCj5gt9pVpHu9enB9D9J6vPUonfTiE3_IpmzoZi39vOU97f3htxS70kCfBnMbyQgXso_7CLJm1NjQ0ziT07XkanKcH50R9tX2NVLHrU1IW8YM1ccvsjiW28IGsHgXQoQkM89V3xWfhFCFBrvLfOHg1GimQ0rfCr2VnhnG-ImKUFfGJbPucyVkuuNvAgPdMoJcVBq2nzZ9ExSGPyDhVW9Fw" />
                                <img alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaSaUHRiAXOACncdfG0YykWH9PwmXlkT0Df_ChLHiaxyCyRqE-vZLmicZkYokqiKIIuqLuMAo0TijfEEWFKWk1KyCdto67nwWHldyatM9uP0F6Fgw_43yaTIVBXsMz59IrzT6HJoaY5ZkGYUgOk0v7LVCJ8PmPh_RDpMO_3ATokltTULcHweMUUgAewTba0X4HNr3xoW6YM7HLF1gDI_96Av-ZN8EqUOc5eQy5fHbIRWdlXQQYnM9ZpBm5YuZRv58wlKq-uaRLJgo" />
                                <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-[#13ec5b] flex items-center justify-center text-xs font-bold text-black">+2k</div>
                            </div>
                            <div className="flex flex-col items-start justify-center">
                                <div className="flex text-yellow-400 text-xs">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </div>
                                <span className="text-xs text-white/70">peladeiros ativos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-[#f8fcf9] dark:bg-[#102216]">
                    <div className="w-full max-w-[440px] flex flex-col gap-8">
                        {/* Heading */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#0d1b12] dark:text-white tracking-tight text-[32px] font-bold leading-tight">Entrar no Craque da Rodada</h1>
                            <p className="text-[#4c9a66] dark:text-[#8ab39b] text-base font-normal leading-normal">Bem-vindo de volta, craque! Organize sua partida agora.</p>
                        </div>

                        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                            {errorMessage && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                    {errorMessage}
                                </div>
                            )}
                            {/* Email Field */}
                            <label className="flex flex-col w-full group">
                                <p className="text-[#0d1b12] dark:text-[#cfe7d7] text-sm font-semibold leading-normal pb-2 ml-1">Email</p>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-4 text-[#4c9a66] pointer-events-none">mail</span>
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-[#0d1b12] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#13ec5b]/50 border border-[#cfe7d7] dark:border-[#2a4030] bg-white dark:bg-[#1c2e22] focus:border-[#13ec5b] h-12 pl-12 pr-4 placeholder:text-[#4c9a66]/50 text-base font-normal leading-normal transition-all disabled:opacity-50"
                                        placeholder="seuemail@exemplo.com.br"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </label>

                            {/* Password Field */}
                            <label className="flex flex-col w-full group">
                                <div className="flex justify-between items-center pb-2 ml-1">
                                    <p className="text-[#0d1b12] dark:text-[#cfe7d7] text-sm font-semibold leading-normal">Senha</p>
                                    <Link className="text-sm font-medium text-[#13ec5b] hover:text-[#0fb946] hover:underline transition-colors" href="/recuperar-senha">Esqueci minha senha</Link>
                                </div>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-4 text-[#4c9a66] pointer-events-none">lock</span>
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-[#0d1b12] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#13ec5b]/50 border border-[#cfe7d7] dark:border-[#2a4030] bg-white dark:bg-[#1c2e22] focus:border-[#13ec5b] h-12 pl-12 pr-12 placeholder:text-[#4c9a66]/50 text-base font-normal leading-normal transition-all disabled:opacity-50"
                                        placeholder="Digite sua senha"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button className="absolute right-4 text-[#4c9a66] hover:text-[#0d1b12] dark:hover:text-white transition-colors cursor-pointer flex items-center" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                            </label>

                            {/* Submit Button (Normal State) */}
                            <button
                                disabled={loading}
                                className={`mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#13ec5b] hover:bg-[#0fb946] text-[#0d1b12] text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-[#13ec5b]/20 hover:shadow-[#13ec5b]/40 transform active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                type="submit"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span className="truncate">Entrar</span>
                                        <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#e7f3eb] dark:border-[#2a4030]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#f8fcf9] dark:bg-[#102216] px-2 text-gray-500">ou continue com</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 rounded-full border border-[#e7f3eb] dark:border-[#2a4030] bg-white dark:bg-[#1c2e22] p-3 hover:bg-gray-50 dark:hover:bg-[#2a4030] transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                <span className="text-sm font-medium text-[#0d1b12] dark:text-white">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-full border border-[#e7f3eb] dark:border-[#2a4030] bg-white dark:bg-[#1c2e22] p-3 hover:bg-gray-50 dark:hover:bg-[#2a4030] transition-colors">
                                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                </svg>
                                <span className="text-sm font-medium text-[#0d1b12] dark:text-white">Facebook</span>
                            </button>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500">
                                Ainda não tem conta?
                                <Link className="font-bold text-[#0d1b12] dark:text-white hover:text-[#13ec5b] dark:hover:text-[#13ec5b] transition-colors pl-1" href="/cadastro">Cadastre-se grátis</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
