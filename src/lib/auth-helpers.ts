import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resiliently fetches the current user, waiting for session hydration if needed.
 * Optimized for Next.js App Router client components on mobile/Vercel.
 */
export async function getResilientUser(supabase: SupabaseClient) {
    console.log("[Auth] Starting getResilientUser...");

    // 1. Try to get session immediately (fastest, usually reads from localStorage)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.warn("[Auth] Session error:", sessionError.message);
    }
    if (session?.user) {
        console.log("[Auth] User found via getSession (immediate)");
        return session.user;
    }

    // 2. Fallback to getUser (server-verified, slightly slower)
    const { data: { user: immediateUser }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.warn("[Auth] User error:", userError.message);
    }
    if (immediateUser) {
        console.log("[Auth] User found via getUser (immediate)");
        return immediateUser;
    }

    // 3. Wait for hydration (critical for mobile browsers and Vercel)
    console.log("[Auth] No user found on first check, waiting for hydration (2500ms)...");
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 4. Retry Session check
    const { data: { session: retrySession } } = await supabase.auth.getSession();
    if (retrySession?.user) {
        console.log("[Auth] User found after hydration (Session)");
        return retrySession.user;
    }

    // 5. Final retry with getUser
    const { data: { user: finalUser } } = await supabase.auth.getUser();
    if (finalUser) {
        console.log("[Auth] User found after hydration (User)");
    } else {
        console.warn("[Auth] No resilient user found after 2500ms wait.");
        console.warn("[Auth] This may indicate a session/cookie issue in production.");
    }
    return finalUser;
}
