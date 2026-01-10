"use client";

import { useState } from "react";

interface ShareButtonProps {
    title?: string;
    text?: string;
    url?: string;
    path?: string; // Caminho relativo, ex: /dashboard/...
}

export default function ShareButton({ title, text, url, path }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Determinar URL final
        let finalUrl = url || window.location.href;
        if (path) {
            finalUrl = `${window.location.origin}${path}`;
        }

        const shareData = {
            title: title || 'Craque da Rodada',
            text: text || 'Bora organizar o jogo! Entra aí no Craque da Rodada.',
            url: finalUrl,
        };

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        // Mobile Share Nativo
        if (navigator.share && isMobile) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                // Se cancelar ou falhar, não faz nada
            }
        }
        // Desktop / Fallback -> Copiar para Clipboard
        else {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(shareData.url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    // Fallback antigo
                    const textArea = document.createElement('textarea');
                    textArea.value = shareData.url;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            } catch (err) {
                alert('Copie este link: ' + shareData.url);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="cursor-pointer items-center justify-center overflow-hidden rounded-full size-12 bg-[#e7f3eb] dark:bg-[#22382b] text-[#0d1b12] dark:text-white hover:bg-[#d8ebe0] dark:hover:bg-[#2a4535] transition-colors flex relative"
            title="Compartilhar"
        >
            {copied ? (
                <span className="material-symbols-outlined text-[#13ec5b] animate-scale-in">check</span>
            ) : (
                <span className="material-symbols-outlined">share</span>
            )}
        </button>
    );
}
