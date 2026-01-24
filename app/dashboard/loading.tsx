import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
            <p className="animate-pulse">Loading...</p>
        </div>
    );
}
