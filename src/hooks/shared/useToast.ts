"use client";

import { useState, useEffect, useCallback } from "react";

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    type: ToastType;
    message: string;
}

export function useToast() {
    const [toast, setToast] = useState<Toast | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = useCallback((type: ToastType, message: string) => {
        setToast({ type, message });
    }, []);

    const showSuccess = useCallback((message: string) => {
        showToast('success', message);
    }, [showToast]);

    const showError = useCallback((message: string) => {
        showToast('error', message);
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast('info', message);
    }, [showToast]);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return {
        toast,
        showToast,
        showSuccess,
        showError,
        showInfo,
        hideToast
    };
}
