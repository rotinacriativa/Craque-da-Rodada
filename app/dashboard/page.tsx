import { createClient } from "../../src/lib/server";
import { DashboardHeader } from "../components/player/dashboard/DashboardHeader";
import { StatsCard } from "../components/player/dashboard/StatsCard";
import { NextMatchCard } from "../components/player/dashboard/NextMatchCard";
import { EmptyMatchState } from "../components/player/dashboard/EmptyMatchState";
import { ActivityFeed } from "../components/player/dashboard/ActivityFeed";
import { CraqueCard } from "../components/player/dashboard/CraqueCard";
import { InviteBanner } from "../components/player/dashboard/InviteBanner";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default States
    let nextMatch = null;
    let nextMatchParticipants: any[] = [];
    let lastCraque = null;
    let stats = { organized: 0, participated: 0 };

    if (user) {
        // 1. Fetch Next Match
        const { data: matches } = await supabase
            .from('matches')
            .select('*, groups(name, logo_url), match_participants!inner(user_id)')
            .eq('match_participants.user_id', user.id)
            .gte('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: true })
            .limit(1);

        if (matches && matches.length > 0) {
            nextMatch = matches[0];

            // 1.1 Fetch Participants
            const { data: partData } = await supabase
                .from('match_participants')
                .select('status, profile:profiles(id, full_name, avatar_url)')
                .eq('match_id', nextMatch.id)
                .eq('status', 'confirmed');

            if (partData) {
                nextMatchParticipants = partData.map((p: any) => p.profile);
            }
        }

        // 2. Fetch Last Match & Craque
        const { data: lastMatches } = await supabase
            .from('matches')
            .select('id')
            .eq('match_participants.user_id', user.id)
            .lt('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: false })
            .limit(1);

        if (lastMatches && lastMatches.length > 0) {
            const lastMatchId = lastMatches[0].id;
            const { data: votes } = await supabase
                .from('match_votes')
                .select('voted_user_id')
                .eq('match_id', lastMatchId)
                .eq('category', 'craque');

            if (votes && votes.length > 0) {
                const voteCounts: Record<string, number> = {};
                votes.forEach((v: any) => {
                    voteCounts[v.voted_user_id] = (voteCounts[v.voted_user_id] || 0) + 1;
                });

                let winnerId = null;
                let maxVotes = 0;
                Object.entries(voteCounts).forEach(([uid, count]) => {
                    if (count > maxVotes) {
                        maxVotes = count;
                        winnerId = uid;
                    }
                });

                if (winnerId) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', winnerId)
                        .single();

                    if (profile) {
                        lastCraque = { ...profile, votes: maxVotes };
                    }
                }
            }
        }

        // 3. Fetch Stats
        const { count: groupsCreated } = await supabase
            .from('groups')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', user.id);

        stats.organized = groupsCreated || 0;
    }

    return (
        <>
            {/* Page Heading */}
            <DashboardHeader />

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StatsCard
                    title="Peladas Organizadas"
                    value={stats.organized}
                    icon="stadium"
                    subtitle="Total acumulado"
                    active={true}
                />
                <StatsCard
                    title="Partidas"
                    value="Em breve"
                    icon="directions_run"
                    subtitle="Estatísticas de jogos"
                    active={false}
                />
                <StatsCard
                    title="Gols"
                    value="Em breve"
                    icon="sports_soccer"
                    subtitle="Ranking de artilharia"
                    active={false}
                />
            </section>

            {/* Featured Card: Next Game */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[#0d1b12] dark:text-white text-xl font-bold">Próxima Pelada</h4>
                </div>

                {nextMatch ? (
                    <NextMatchCard
                        match={{
                            id: nextMatch.id,
                            name: nextMatch.name,
                            date: nextMatch.date,
                            start_time: nextMatch.start_time,
                            location: nextMatch.location,
                            group_id: nextMatch.group_id,
                            image_url: nextMatch.image_url,
                            group_logo_url: nextMatch.groups?.logo_url
                        }}
                        groupName={nextMatch.groups?.name || 'Grupo'}
                        participants={nextMatchParticipants}
                    />
                ) : (
                    <EmptyMatchState hasGroups={stats.organized > 0} />
                )}
            </section>

            {/* Quick Access / Secondary Content */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <ActivityFeed />

                {/* Last Craque Card */}
                <CraqueCard craque={lastCraque} />

                {/* Invite Banner */}
                <InviteBanner />
            </section>
        </>
    );
}
