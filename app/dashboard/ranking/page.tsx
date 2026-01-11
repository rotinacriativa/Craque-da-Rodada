import { createClient } from "../../../src/lib/server";
import RankingView from "./RankingView";

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
    const supabase = await createClient();
    const { groupId } = await searchParams;

    // 1. Fetch Ranking Data
    // Handle 'all' or empty groupId
    const validGroupId = (groupId && groupId !== 'all' && groupId !== 'undefined') ? groupId : null;

    const { data: players, error } = await supabase
        .rpc('get_player_ranking', {
            p_group_id: validGroupId,
        });

    if (error) {
        console.error("Error fetching ranking details:", error.message, error.details, error.hint);
        // We can throw or just pass empty array
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

    // 3. Fetch Match History (Last 2 finished)
    let historyQuery = supabase
        .from('matches')
        .select('*, match_participants(count)')
        .eq('status', 'finished')
        .order('date', { ascending: false })
        .limit(2);

    if (validGroupId) {
        historyQuery = historyQuery.eq('group_id', validGroupId);
    }
    const { data: recentMatches } = await historyQuery;

    // 4. Fetch Next Match
    let nextMatchQuery = supabase
        .from('matches')
        .select('*, groups(name)')
        .eq('status', 'scheduled')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1);

    if (validGroupId) {
        nextMatchQuery = nextMatchQuery.eq('group_id', validGroupId);
    }
    const { data: nextMatchData } = await nextMatchQuery;

    return (
        <RankingView
            players={players || []}
            groups={groups}
            currentGroupId={groupId}
            recentMatches={recentMatches || []}
            nextMatch={nextMatchData?.[0] || null}
        />
    );
}
