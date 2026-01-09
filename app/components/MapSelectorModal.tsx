"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for MapContainer to avoid SSR issues
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const useMapEvents = dynamic(
    () => import("react-leaflet").then((mod) => mod.useMapEvents),
    { ssr: false }
);

interface MapSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (data: { lat: number; lon: number; address: string }) => void;
    initialLat?: number | null;
    initialLon?: number | null;
}

export default function MapSelectorModal({ isOpen, onClose, onSelect, initialLat, initialLon }: MapSelectorModalProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // Initialize position
    useEffect(() => {
        if (initialLat && initialLon) {
            setPosition({ lat: initialLat, lng: initialLon });
        } else if (isOpen && !position) {
            // Default: Try HTML5 Geolocation
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    // Fallback to São Paulo
                    setPosition({ lat: -23.55052, lng: -46.633308 });
                }
            );
        }
    }, [isOpen, initialLat, initialLon]);

    // Fix for Leaflet icons not showing
    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            import("leaflet").then((L) => {
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                });
            });
        }
    }, []);

    const handleConfirm = () => {
        if (position) {
            onSelect({ lat: position.lat, lon: position.lng, address: address || "Local selecionado no mapa" });
            onClose();
        }
    };

    // Helper component to handle map clicks
    function ClickHandler() {
        const map = useMapEvents({ // Check this import if it fails, might need to be imported differently with dynamic
            click(e: any) {
                setPosition(e.latlng);
                fetchAddress(e.latlng.lat, e.latlng.lng);
            },
        });

        // Fly to position when it changes programmatically (e.g. geolocation)
        useEffect(() => {
            if (position) {
                map.flyTo(position, 16);
            }
        }, [position, map]);

        return position ? (
            // @ts-ignore
            <Marker position={position} />
        ) : null;
    }

    // Since we are using dynamic imports, we need a wrapper to render the ClickHandler inside MapContainer context
    // However, useMapEvents is a hook, so it must be inside MapContainer.
    // The dynamic imports return Components. We need to check if we can use hooks from 'react-leaflet' directly if we import them.
    // Actually, hooks like useMapEvents work if 'react-leaflet' is present. 
    // BUT since we are dynamically importing everything to avoid "window is not defined", we need to be careful.
    // A better approach for the ClickHandler with dynamic imports:

    // Let's create a Client Component specific for the Map content to simplify
    // For now, let's try to bundle the logic inside a dynamically imported component

    const MapContent = useMemo(() => dynamic(() => Promise.resolve(({ setPos }: { setPos: any }) => {
        const { useMapEvents, Marker } = require("react-leaflet"); // specific require inside dynamic
        const map = useMapEvents({
            click(e: any) {
                setPos(e.latlng);
                // Trigger address fetch outside or pass callback
            },
        });
        // We can't easily pass state back up from here without props.
        // Let's retry: define ClickHandler using the dynamic imports? No, hooks are tricky.

        return null;
    }), { ssr: false }), []);

    // Better strategy: Simple client-side only component.
    // Since this file IS "use client", the main issue is just the "window" check for Leaflet library itself.
    // 'react-leaflet' imports bring in 'leaflet' which crashes SSR.

    // Let's try fetching address
    const fetchAddress = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { "User-Agent": "Craque da Rodada/1.0" }
            });
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
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Selecionar Local</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Clique no mapa para marcar o local exato</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-state-500">close</span>
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-100 h-[400px] md:h-[500px]">
                    {position && (
                        // @ts-ignore
                        <MapWithNoSSR
                            position={position}
                            setPosition={(pos: any) => {
                                setPosition(pos);
                                fetchAddress(pos.lat, pos.lng);
                            }}
                        />
                    )}
                    {!position && (
                        <div className="flex items-center justify-center h-full">
                            <span className="animate-spin material-symbols-outlined text-4xl text-[#13ec5b]">progress_activity</span>
                        </div>
                    )}

                    {/* Address Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-[#1a2c20] p-4 rounded-xl shadow-lg border border-[#e7f3eb] dark:border-[#2a4535] z-[1000]">
                        <p className="text-xs font-bold text-[#13ec5b] uppercase mb-1">Endereço Selecionado</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                            {loading ? "Buscando endereço..." : (address || "Nenhum local selecionado")}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#15231a]">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!position || loading}
                        className="px-6 py-2.5 rounded-lg bg-[#13ec5b] hover:bg-[#0eb345] text-[#0d1b12] font-bold shadow-lg shadow-[#13ec5b]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">check_circle</span>
                        Confirmar Local
                    </button>
                </div>
            </div>
        </div>
    );
}

// Internal component to handle Map logic safely with Dynamic Import
const MapWithNoSSR = dynamic(() => Promise.resolve(({ position, setPosition }: any) => {
    // Import React Leaflet hooks/components here to ensure they run only on client
    const { MapContainer, TileLayer, Marker, useMapEvents } = require("react-leaflet");

    function LocationMarker() {
        const map = useMapEvents({
            click(e: any) {
                setPosition(e.latlng);
            },
        });

        // Auto-pan
        useEffect(() => {
            map.flyTo(position, map.getZoom());
        }, [position]);

        return position === null ? null : (
            <Marker position={position}></Marker>
        );
    }

    return (
        <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
}), { ssr: false });
