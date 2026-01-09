"use client";

import { useState } from "react";

export default function ShareButton() {
    const handleShare = async () => {
        const shareData = {
            title: 'Craque da Rodada',
            text: 'Bora organizar o jogo! Entra aí no Craque da Rodada.',
            url: window.location.origin,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copiado! Envie para seus amigos.');
            } catch (err) {
                alert('Copie este link: ' + shareData.url);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="cursor-pointer items-center justify-center overflow-hidden rounded-full size-12 bg-[#e7f3eb] dark:bg-[#22382b] text-[#0d1b12] dark:text-white hover:bg-[#d8ebe0] dark:hover:bg-[#2a4535] transition-colors flex"
        >
            <span className="material-symbols-outlined">share</span>
        </button>
    );
}
