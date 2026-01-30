import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import AIProjectCreator from "@/components/dashboard/AIProjectCreator";

export default async function DashboardPage() {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile for name
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single();
    const name = profile?.full_name?.split(' ')[0] || user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || "there";

    const hours = new Date().getHours();
    const greeting = hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center -mt-8 px-4">
            <AIProjectCreator />
        </div>
    );
}
