"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../src/lib/client";

export default function GroupAdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkPermission() {
            try {
                // 1. Get Current User
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login");
                    return;
                }

                // 2. Check Group Membership & Role
                const { data: member, error } = await supabase
                    .from('group_members')
                    .select('role')
                    .eq('group_id', groupId)
                    .eq('user_id', user.id)
                    .single();

                if (error || !member || (member.role !== 'admin' && member.role !== 'owner')) {
                    // Not an admin? Redirect to group home
                    console.warn("Access denied: User is not an admin of this group.");
                    router.push(`/dashboard/grupos/${groupId}`);
                    return;
                }

                // 3. Authorized
                setAuthorized(true);

            } catch (error) {
                console.error("Auth check failed", error);
                router.push(`/dashboard/grupos/${groupId}`);
            } finally {
                setChecking(false);
            }
        }

        if (groupId) checkPermission();
    }, [groupId, router]);

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="size-8 block rounded-full border-4 border-gray-300 border-t-[#13ec5b] animate-spin"></span>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
