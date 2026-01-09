import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resiliently fetches the current user, waiting for session hydration if needed.
 * Optimized for Next.js App Router client components on mobile/Vercel.
 */
export async function getResilientUser(supabase: SupabaseClient) {
    // 1. Try to get session immediately (fastest, usually reads from localStorage)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;

    // 2. Fallback to getUser (server-verified, slightly slower)
    const { data: { user: immediateUser } } = await supabase.auth.getUser();
    if (immediateUser) return immediateUser;

    // 3. Wait for hydration (critical for mobile browsers)
    console.log("No user found on first check, waiting for hydration...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Retry getUser after delay
    const { data: { user: retryUser } } = await supabase.auth.getUser();
    return retryUser;
}
