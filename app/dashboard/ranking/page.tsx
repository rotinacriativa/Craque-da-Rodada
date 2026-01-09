import { createClient } from "../../../src/lib/server";
import RankingView from "./RankingView";

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
    const supabase = await createClient();
    const { groupId } = await searchParams;

    // 1. Fetch Ranking Data
    // Note: We are using the RPC function we created in SQL
    const { data: players, error } = await supabase
        .rpc('get_player_ranking', {
            p_group_id: groupId || null,
            // You can add season start/end dates here if needed later
            // p_start_date: '2026-01-01'
        });

    if (error) {
        console.error("Error fetching ranking:", error);
        // Handle error gracefully (maybe show empty state or toast in client)
    }

    // 2. Fetch Groups for Filter
    const { data: { user } } = await supabase.auth.getUser();
    let groups: { id: string, name: string }[] = [];

    if (user) {
        const { data: userGroups } = await supabase
            .from('groups')
            .select('id, name')
            .eq('created_by', user.id); // Or fetch groups user is part of? optimizing for created_by for now as admin

        if (userGroups) {
            groups = userGroups;
        }
    }

    return (
        <RankingView
            players={players || []}
            groups={groups}
            currentGroupId={groupId}
        />
    );
}
