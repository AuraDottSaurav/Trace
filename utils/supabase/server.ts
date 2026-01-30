import { createServerClient } from '@supabase/ssr'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const { getToken } = await auth()

    // Get the Clerk session token for Supabase
    // Note: The user MUST have created a template named 'supabase' in Clerk Dashboard
    // If not, this will return null/undefined and RLS will treat as anon
    const clerkToken = await getToken({ template: 'supabase' })
    console.log("[Supabase Server] Clerk Token found:", !!clerkToken);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase Environment variables (URL/Key) are missing!");
    }

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            global: {
                // Get the custom Supabase token from Clerk
                headers: clerkToken ? {
                    Authorization: `Bearer ${clerkToken}`,
                } : {},
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}
