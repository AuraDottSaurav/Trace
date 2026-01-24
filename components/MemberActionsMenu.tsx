"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Shield, Trash2, UserCog, Loader2, Check } from "lucide-react";
import { updateMemberRole, removeMember } from "@/actions/organization";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MemberActionsMenuProps {
    memberId: string;
    currentRole: string;
    isCurrentUser: boolean;
}

export default function MemberActionsMenu({ memberId, currentRole, isCurrentUser }: MemberActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    // Toggle and calculate position
    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position: below the button, aligned right
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 192, // 192px = w-48 (dropdown width)
            });
        }
        setIsOpen(!isOpen);
    };

    // Close on scroll or resize to prevent floating issues
    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => setIsOpen(false);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleScroll);
        };
    }, [isOpen]);

    // Close on click outside (document level)
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
            setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleRoleChange = async () => {
        setIsLoading(true);
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        const result = await updateMemberRole(memberId, newRole);
        setIsLoading(false);
        setIsOpen(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`Role updated to ${newRole}`);
            router.refresh();
        }
    };

    const handleRemove = async () => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        setIsLoading(true);
        const result = await removeMember(memberId);
        setIsLoading(false);
        setIsOpen(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Member removed");
            router.refresh();
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <MoreHorizontal size={18} />}
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[9999] w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
                    style={{
                        top: coords.top - window.scrollY, // Fixed positioning needs viewport coords
                        left: coords.left - window.scrollX
                    }}
                >
                    <div className="p-1">
                        {!isCurrentUser && (
                            <button
                                onClick={handleRoleChange}
                                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                            >
                                <Shield size={16} />
                                {currentRole === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                            </button>
                        )}
                        <button
                            onClick={handleRemove}
                            className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 mt-1"
                        >
                            <Trash2 size={16} />
                            {isCurrentUser ? "Leave Team" : "Remove Member"}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

