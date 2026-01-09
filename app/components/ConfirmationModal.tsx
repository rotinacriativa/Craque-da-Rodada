"use client";

import { useState, useEffect } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'success';
    verificationText?: string; // If set, user must type this to enable confirm button
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = 'info',
    verificationText,
    isLoading = false
}: ConfirmationModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(!verificationText);

    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setIsConfirmEnabled(!verificationText);
        }
    }, [isOpen, verificationText]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (verificationText) {
            setIsConfirmEnabled(value === verificationText);
        }
    };

    if (!isOpen) return null;

    // Determine colors based on type
    const colors = {
        danger: {
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-600 dark:text-red-400",
            button: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30",
            icon: "warning"
        },
        info: {
            iconBg: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-600 dark:text-blue-400",
            button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30",
            icon: "info"
        },
        success: {
            iconBg: "bg-[#13ec5b]/10",
            iconColor: "text-[#0ea841] dark:text-[#13ec5b]",
            button: "bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] shadow-[#13ec5b]/30",
            icon: "check_circle"
        }
    };

    const currentStyle = colors[type];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a2c22] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`size-16 rounded-full ${currentStyle.iconBg} flex items-center justify-center mb-6`}>
                        <span className={`material-symbols-outlined text-3xl ${currentStyle.iconColor}`}>
                            {currentStyle.icon}
                        </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#0d1b12] dark:text-white mb-3">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {message}
                    </p>

                    {verificationText && (
                        <div className="w-full mb-6">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 text-left">
                                Digite <span className="select-all font-mono bg-gray-100 dark:bg-black/30 px-1 rounded border border-gray-200 dark:border-gray-700">{verificationText}</span> para confirmar:
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder={`Digite ${verificationText}`}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-[#13ec5b] focus:ring-0 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isConfirmEnabled || isLoading}
                            className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${currentStyle.button} ${(!isConfirmEnabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <span className="size-5 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
                            ) : null}
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
