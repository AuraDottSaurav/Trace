import { User } from "lucide-react";

interface MemberFilterProps {
    members: any[];
    activeFilter: string | null;
    onToggle: (memberId: string) => void;
}

export default function MemberFilter({ members, activeFilter, onToggle }: MemberFilterProps) {
    return (
        <div className="flex items-center -space-x-1.5 overflow-x-auto no-scrollbar py-1 px-1">
            {members.map(member => (
                <button
                    key={member.id}
                    onClick={() => onToggle(member.userId)}
                    title={member.name}
                    className={`relative w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:z-10 hover:scale-105 focus:outline-none flex items-center justify-center overflow-hidden ${activeFilter === member.userId ? "ring-2 ring-indigo-600 z-10" : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100"}`}
                >
                    {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                            {member.name?.[0]}
                        </div>
                    )}
                </button>
            ))}
            {/* Unassigned Filter */}
            <button
                onClick={() => onToggle("unassigned")}
                title="Unassigned"
                className={`relative w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 transition-transform hover:z-10 hover:scale-105 focus:outline-none flex items-center justify-center ${activeFilter === "unassigned" ? "ring-2 ring-indigo-600 z-10" : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100"}`}
            >
                <User size={14} className="text-slate-500" />
            </button>
        </div>
    );
}
