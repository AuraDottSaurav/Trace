import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const cookieStore = await (await import("next/headers")).cookies();
        const response = NextResponse.redirect(`${origin}${next}`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                                response.cookies.set(name, value, options);
                            });
                        } catch (error) {
                            console.error("[Auth Callback] Error setting cookies:", error);
                        }
                    },
                },
            }
        );

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (!sessionError) {
            // Check if user has any organization memberships
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: memberships } = await supabase
                    .from("organization_members")
                    .select("id")
                    .eq("user_id", user.id)
                    .limit(1);

                if (!memberships || memberships.length === 0) {
                    // Create default organization
                    const orgName = "My Project";
                    const slug = `org-${user.id.slice(0, 8)}-${Math.floor(Math.random() * 1000)}`;

                    const { data: org, error: orgError } = await supabase
                        .from("organizations")
                        .insert({
                            name: orgName,
                            slug: slug,
                            owner_id: user.id
                        })
                        .select()
                        .single();

                    if (org && !orgError) {
                        // Add user as admin
                        await supabase.from("organization_members").insert({
                            organization_id: org.id,
                            user_id: user.id,
                            role: "admin"
                        });
                    }
                }
            }

            return response;
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=Could not login with provider`);
}
