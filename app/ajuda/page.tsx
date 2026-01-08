'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AjudaPage() {
    const [isDark, setIsDark] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        // Check local storage or system preference on mount
        if (
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            html.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-sans antialiased transition-colors duration-300 min-h-screen">
            <header className="sticky top-0 z-50 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="text-primary">
                                <span className="material-icons-round text-3xl">sports_soccer</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                Craque da Rodada
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link
                                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition-colors"
                                href="/"
                            >
                                Início
                            </Link>
                            <Link
                                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition-colors"
                                href="/#como-funciona"
                            >
                                Funcionalidades
                            </Link>
                            <Link className="text-primary font-semibold" href="#">
                                Ajuda
                            </Link>
                        </nav>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <span className="material-icons-round">light_mode</span>
                                ) : (
                                    <span className="material-icons-round">dark_mode</span>
                                )}
                            </button>
                            <Link
                                href="/cadastro"
                                className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:outline-none transition-all"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative overflow-hidden bg-surface-light dark:bg-surface-dark pt-16 pb-20 lg:pt-24 lg:pb-28">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full z-0 opacity-30 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-[128px] animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-300 dark:bg-green-900 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 tracking-wide uppercase">
                        Central de Suporte
                    </span>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-6">
                        Como podemos ajudar, craque?
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Encontre respostas rápidas sobre como organizar sua pelada, gerenciar
                        pagamentos e escalar seu time.
                    </p>
                    <div className="mt-10 max-w-xl mx-auto">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">
                                    search
                                </span>
                            </div>
                            <input
                                className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary dark:focus:border-primary focus:ring-0 shadow-lg transition-all duration-300"
                                placeholder="Busque por 'pagamentos', 'convites', 'escalação'..."
                                type="text"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <section className="relative z-10 -mt-12 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link
                            href="#"
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                                <span className="material-icons-round text-2xl">flag</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Primeiros Passos
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tudo o que você precisa saber para começar a usar o Craque da Rodada
                                hoje mesmo.
                            </p>
                        </Link>
                        <Link
                            href="#"
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                                <span className="material-icons-round text-2xl">groups</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Gerenciando Grupos
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aprenda a criar grupos, adicionar adminstradores e definir
                                regras.
                            </p>
                        </Link>
                        <Link
                            href="#"
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                                <span className="material-icons-round text-2xl">
                                    account_circle
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Minha Conta
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Gerencie seu perfil, assinatura, estatísticas e configurações de
                                segurança.
                            </p>
                        </Link>
                        <Link
                            href="#"
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                                <span className="material-icons-round text-2xl">
                                    build_circle
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Solução de Problemas
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Encontrou um erro ou algo não funciona? Veja como resolver aqui.
                            </p>
                        </Link>
                    </div>
                </div>
            </section>
            <section className="py-12 bg-background-light dark:bg-background-dark relative z-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Perguntas Frequentes
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Como criar uma nova pelada?",
                                a: "Para criar uma nova pelada, acesse o painel principal e clique no botão verde \"Criar Partida\" no canto superior direito. Preencha os detalhes como data, hora, local e limite de jogadores."
                            },
                            {
                                q: "Como convidar jogadores para o meu grupo?",
                                a: "Vá até a aba \"Gerenciar Grupo\", selecione o grupo desejado e clique em \"Convidar\". Você pode enviar o link direto via WhatsApp ou adicionar por e-mail."
                            },
                            {
                                q: "É possível cobrar a mensalidade pelo app?",
                                a: "Sim! O Craque da Rodada possui uma funcionalidade de \"Financeiro\" onde você pode registrar quem pagou ou gerar links de pagamento (Pix) para facilitar a cobrança."
                            },
                            {
                                q: "Esqueci minha senha, como recuperar?",
                                a: "Na tela de login, clique em \"Esqueci minha senha\". Digite seu e-mail cadastrado e enviaremos um link seguro para redefinição em poucos instantes."
                            },
                            {
                                q: "Como exportar os dados da pelada?",
                                a: "Acesse o menu \"Configurações\" da sua partida e procure pela opção \"Exportar Dados\". Você pode baixar um arquivo CSV ou PDF com todas as estatísticas e pagamentos."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex justify-between items-center p-5 cursor-pointer select-none text-left focus:outline-none"
                                >
                                    <h4 className={`text-lg font-medium transition-colors ${openFaq === index ? 'text-primary' : 'text-gray-900 dark:text-white group-hover:text-primary'}`}>
                                        {faq.q}
                                    </h4>
                                    <span className={`material-icons-round text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-5 pb-5 text-gray-600 dark:text-gray-300">
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-16 bg-white dark:bg-gray-800 mt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E676]/20 text-[#00E676] mb-6">
                        <span className="material-icons-round text-3xl">headset_mic</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Ainda precisa de ajuda?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        Não encontrou o que procurava? Nossa equipe de suporte está pronta
                        para entrar em campo e resolver seu problema.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#00E676] hover:bg-green-500 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                        >
                            <span className="material-icons-round mr-2">chat</span> Fale
                            Conosco
                        </Link>
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:text-lg transition-colors"
                        >
                            <span className="material-icons-round mr-2">email</span> Enviar
                            E-mail
                        </Link>
                    </div>
                </div>
            </section>
            <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-icons-round text-2xl text-primary">
                                    sports_soccer
                                </span>
                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                    Craque da Rodada
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Organize sua pelada como um profissional. Gerencie times,
                                pagamentos e estatísticas em um só lugar.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Produto
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Funcionalidades
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Preços
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Para Arenas
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Suporte
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Central de Ajuda
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Fale Conosco
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Status do Sistema
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Legal
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Termos de Uso
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Privacidade
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="hover:text-primary transition-colors"
                                        href="#"
                                    >
                                        Cookies
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © 2023 Craque da Rodada. Todos os direitos reservados.
                        </p>
                        <div className="flex space-x-6">
                            <Link
                                className="text-gray-400 hover:text-primary transition-colors"
                                href="#"
                            >
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        clipRule="evenodd"
                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                        fillRule="evenodd"
                                    ></path>
                                </svg>
                            </Link>
                            <Link
                                className="text-gray-400 hover:text-primary transition-colors"
                                href="#"
                            >
                                <span className="sr-only">Instagram</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        clipRule="evenodd"
                                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08v.001zm0 1.802c-2.69 0-2.977.01-4.017.058-.958.044-1.478.204-1.823.338-.456.177-.781.387-1.122.728-.341.341-.551.666-.728 1.122-.134.345-.294.865-.338 1.823-.047 1.04-.058 1.327-.058 4.017s.01 2.977.058 4.017c.044.958.204 1.478.338 1.823.177.456.387.781.728 1.122.341.341.666.551 1.122.728.345.134.865.294 1.823.338 1.04.047 1.327.058 4.017.058s2.977-.01 4.017-.058c.958-.044 1.478-.204 1.823-.338.456-.177.781-.387 1.122-.728.341-.341.551-.666.728-1.122.134-.345.294-.865.338-1.823.047-1.04.058-1.327.058-4.017s-.01-2.977-.058-4.017c-.044-.958-.204-1.478-.338-1.823-.177-.456-.387-.781-.728-1.122-.341-.341-.666-.551-1.122-.728-.345-.134-.865-.294-1.823-.338-1.04-.047-1.327-.058-4.017-.058zm0 4.545a4.256 4.256 0 110 8.512 4.256 4.256 0 010-8.512zm0 1.802a2.454 2.454 0 100 4.908 2.454 2.454 0 000-4.908zm5.565-4.47a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                        fillRule="evenodd"
                                    ></path>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
