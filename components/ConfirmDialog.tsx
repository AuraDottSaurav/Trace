"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger"
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            iconBg: "bg-red-100 dark:bg-red-900/30",
            iconColor: "text-red-600 dark:text-red-400",
            buttonBg: "bg-red-600 hover:bg-red-700",
            buttonShadow: "shadow-red-600/20"
        },
        warning: {
            iconBg: "bg-amber-100 dark:bg-amber-900/30",
            iconColor: "text-amber-600 dark:text-amber-400",
            buttonBg: "bg-amber-600 hover:bg-amber-700",
            buttonShadow: "shadow-amber-600/20"
        },
        info: {
            iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
            iconColor: "text-indigo-600 dark:text-indigo-400",
            buttonBg: "bg-indigo-600 hover:bg-indigo-700",
            buttonShadow: "shadow-indigo-600/20"
        }
    };

    const styles = colors[variant];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${styles.buttonBg} ${styles.buttonShadow} disabled:opacity-70`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
