"use client";

import { useState, useEffect, useRef } from "react";

interface AddressSuggestion {
    display_name: string;
    lat: string;
    lon: string;
}

interface AddressAutocompleteProps {
    onSelect: (address: string, lat: string, lon: string) => void;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string; // To accept formatting from parent
    value?: string;
}

export default function AddressAutocomplete({ onSelect, onChange, placeholder = "Digite o endereço...", className, value }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value || "");
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync with external value if provided
    useEffect(() => {
        if (value !== undefined) {
            setQuery(value);
        }
    }, [value]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 3) return;

            setIsLoading(true);
            try {
                // Using OpenStreetMap Nominatim API (Free, requires User-Agent)
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=br`,
                    { headers: { "User-Agent": "Craque da Rodada matches/1.0" } }
                );
                const data = await response.json();
                setSuggestions(data);
                setIsOpen(true);
            } catch (error) {
                console.error("Error fetching address:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item: AddressSuggestion) => {
        setQuery(item.display_name);
        if (onChange) onChange(item.display_name); // Call onChange when an item is selected
        setIsOpen(false);
        onSelect(item.display_name, item.lat, item.lon);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setQuery(newValue);
                    if (onChange) onChange(newValue);
                    if (newValue.length === 0) {
                        setIsOpen(false);
                    }
                }}
                placeholder={placeholder}
                className={className} // Pass styled class from parent
            />

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="size-4 block rounded-full border-2 border-[#13ec5b] border-r-transparent animate-spin"></span>
                </div>
            )}

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-[#1a2c20] rounded-xl shadow-xl border border-[#e7f3eb] dark:border-[#2a4535] overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <button
                            key={index}
                            type="button" // Prevent form submission
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-3 hover:bg-[#f6f8f6] dark:hover:bg-[#102216] border-b border-[#e7f3eb] dark:border-[#2a4535] last:border-0 transition-colors flex items-start gap-3 group"
                        >
                            <span className="material-symbols-outlined text-[#4c9a66] group-hover:text-[#13ec5b] mt-0.5 text-lg shrink-0">location_on</span>
                            <span className="text-sm text-[#0d1b12] dark:text-white line-clamp-2">{item.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
