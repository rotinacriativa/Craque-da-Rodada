"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// @ts-ignore
import L from "leaflet";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapInternalProps {
    position: { lat: number; lng: number } | null;
    onPositionChange: (pos: { lat: number; lng: number }) => void;
}

function LocationMarker({ position, onPositionChange }: MapInternalProps) {
    const map = useMapEvents({
        click(e) {
            onPositionChange(e.latlng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapInternal({ position, onPositionChange }: MapInternalProps) {
    // Default center if no position (São Paulo)
    const center = position || { lat: -23.55052, lng: -46.633308 };

    return (
        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} onPositionChange={onPositionChange} />
        </MapContainer>
    );
}
