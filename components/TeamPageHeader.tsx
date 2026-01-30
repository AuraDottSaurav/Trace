"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import InviteMemberModal from "@/components/InviteMemberModal";

export default function TeamPageHeader() {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Team</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your team members and permissions</p>
            </div>
            <button
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
                <Plus size={18} />
                <span>Invite Member</span>
            </button>

            <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>
    );
}
