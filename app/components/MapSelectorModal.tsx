"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import for MapInternal to avoid SSR issues with Leaflet
const MapInternal = dynamic(() => import("./MapInternal"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-slate-100">
            <div className="flex flex-col items-center gap-2">
                <span className="animate-spin material-symbols-outlined text-4xl text-[#13ec5b]">
                    progress_activity
                </span>
                <span className="text-sm text-slate-500 font-medium">Carregando mapa...</span>
            </div>
        </div>
    ),
});

interface MapSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (data: { lat: number; lon: number; address: string }) => void;
    initialLat?: number | null;
    initialLon?: number | null;
}

export default function MapSelectorModal({
    isOpen,
    onClose,
    onSelect,
    initialLat,
    initialLon,
}: MapSelectorModalProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
        null
    );
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Initialize position
    useEffect(() => {
        if (initialLat && initialLon) {
            setPosition({ lat: initialLat, lng: initialLon });
        } else if (isOpen && !position) {
            // Default: Try HTML5 Geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setPosition({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                        });
                        // Optional: Fetch address for initial position?
                        // fetchAddress(pos.coords.latitude, pos.coords.longitude);
                    },
                    (err) => {
                        console.error("Geolocation error:", err);
                        // Fallback to São Paulo
                        setPosition({ lat: -23.55052, lng: -46.633308 });
                    }
                );
            } else {
                setPosition({ lat: -23.55052, lng: -46.633308 });
            }
        }
    }, [isOpen, initialLat, initialLon]);

    const handleConfirm = () => {
        if (position) {
            onSelect({
                lat: position.lat,
                lon: position.lng,
                address: address || "Local selecionado no mapa",
            });
            onClose();
        }
    };

    const fetchAddress = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: { "User-Agent": "Craque da Rodada/1.0" },
                }
            );
            const data = await res.json();
            setAddress(data.display_name);
        } catch (error) {
            console.error(error);
            setAddress("Endereço não encontrado");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a2c20] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            Selecionar Local
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Clique no mapa para marcar o local exato
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-state-500">
                            close
                        </span>
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-100 h-[400px] md:h-[500px]">
                    <MapInternal
                        position={position}
                        onPositionChange={(pos) => {
                            setPosition(pos);
                            fetchAddress(pos.lat, pos.lng);
                        }}
                    />

                    {/* Address Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-[#1a2c20] p-4 rounded-xl shadow-lg border border-[#e7f3eb] dark:border-[#2a4535] z-[1000]">
                        <p className="text-xs font-bold text-[#13ec5b] uppercase mb-1">
                            Endereço Selecionado
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                            {loading
                                ? "Buscando endereço..."
                                : address || "Nenhum local selecionado"}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#15231a]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!position || loading}
                        className="px-6 py-2.5 rounded-lg bg-[#13ec5b] hover:bg-[#0eb345] text-[#0d1b12] font-bold shadow-lg shadow-[#13ec5b]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">
                            check_circle
                        </span>
                        Confirmar Local
                    </button>
                </div>
            </div>
        </div>
    );
}
