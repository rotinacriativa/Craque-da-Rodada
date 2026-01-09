import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
    // 1. Check for Service Role Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Server misconfiguration: Missing Service Role Key' }, { status: 500 });
    }

    // 2. Initialize Admin Client
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 3. Verify User Session (using standard client or headers)
    // We need to know WHICH user is requesting deletion.
    // We can parse the Authorization header "Bearer <token>"
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    try {
        // 4. Cleanup Storage (Optional but recommended)
        // We need to read the user's profile to find their avatar URL *before* deleting them.
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        if (profile?.avatar_url) {
            // Extract path from URL. Assuming buckets are 'avatars' or similar.
            // Example URL: .../storage/v1/object/public/avatars/folder/file.jpg
            // We need to try deleting it. Simple heuristic or precise parsing needed.
            // For now, let's assume 'avatars' bucket.
            const urlParts = profile.avatar_url.split('/avatars/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1];
                await supabaseAdmin.storage.from('avatars').remove([filePath]);
            }
        }

        // 5. Delete User (This triggers DB Cascade)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            throw deleteError;
        }

        return NextResponse.json({ message: 'Account deleted successfully' });

    } catch (error: any) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
