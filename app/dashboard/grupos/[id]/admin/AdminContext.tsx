"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../src/lib/client";

interface AdminContextType {
    isAuthorized: boolean;
    isLoading: boolean;
    groupId: string;
    user: any | null;
    role: "owner" | "admin" | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({
    children,
    groupId
}: {
    children: ReactNode;
    groupId: string;
}) {
    const router = useRouter();
    const [isAuthorized, setAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<"owner" | "admin" | null>(null);

    useEffect(() => {
        async function checkPermission() {
            try {
                // 1. Get Current Session (More robust for client-side check)
                const { data: { session } } = await supabase.auth.getSession();

                if (!session || !session.user) {
                    console.log("No session found in AdminContext");
                    // Try getUser as a backup/validation
                    const { data: { user: serverUser } } = await supabase.auth.getUser();
                    if (!serverUser) {
                        router.push("/login");
                        return;
                    }
                    setUser(serverUser);
                } else {
                    setUser(session.user);
                }

                const currentUser = session?.user || user; // Ensure we have a user object
                if (!currentUser) return; // Should be handled above


                // 2. Check Group Membership & Role
                // Check if creator
                const { data: group } = await supabase
                    .from('groups')
                    .select('created_by')
                    .eq('id', groupId)
                    .single();

                if (group && group.created_by === user.id) {
                    setAuthorized(true);
                    setRole("owner");
                    setIsLoading(false);
                    return;
                }

                // Check member role
                const { data: member, error } = await supabase
                    .from('group_members')
                    .select('role')
                    .eq('group_id', groupId)
                    .eq('user_id', user.id)
                    .single();

                if (error || !member || (member.role !== 'admin' && member.role !== 'owner')) {
                    console.warn("Access denied: User is not an admin.");
                    router.push(`/dashboard/grupos/${groupId}`);
                    return;
                }

                setAuthorized(true);
                setRole(member.role as "owner" | "admin");

            } catch (error) {
                console.error("Auth check failed", error);
                router.push(`/dashboard/grupos/${groupId}`);
            } finally {
                setIsLoading(false);
            }
        }

        if (groupId) {
            checkPermission();
        }
    }, [groupId, router]);

    return (
        <AdminContext.Provider value={{ isAuthorized, isLoading, groupId, user, role }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
