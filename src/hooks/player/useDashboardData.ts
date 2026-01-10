"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/server";
import type { DashboardData, DashboardStats, NextMatchData, LastCraque } from "../../lib/types/player";

export function useDashboardData(userId: string | null) {
    const [data, setData] = useState<DashboardData>({
        nextMatch: null,
        lastCraque: null,
        stats: { organized: 0, participated: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const supabase = await createClient();

            // Fetch Next Match
            const { data: matches } = await supabase
                .from('matches')
                .select('*, groups(name), match_participants!inner(user_id)')
                .eq('match_participants.user_id', userId)
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true })
                .limit(1);

            let nextMatch: NextMatchData | null = null;

            if (matches && matches.length > 0) {
                const match = matches[0];

                // Fetch Participants
                const { data: partData } = await supabase
                    .from('match_participants')
                    .select('status, profile:profiles(id, full_name, avatar_url)')
                    .eq('match_id', match.id)
                    .eq('status', 'confirmed');

                const participants = partData?.map((p: any) => p.profile) || [];

                nextMatch = {
                    match: {
                        id: match.id,
                        name: match.name,
                        date: match.date,
                        start_time: match.start_time,
                        end_time: match.end_time,
                        location: match.location,
                        price: match.price,
                        capacity: match.capacity,
                        group_id: match.group_id
                    },
                    group: match.groups,
                    participants
                };
            }

            // Fetch Last Match & Craque
            const { data: lastMatches } = await supabase
                .from('matches')
                .select('id')
                .eq('match_participants.user_id', userId)
                .lt('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: false })
                .limit(1);

            let lastCraque: LastCraque | null = null;

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

                    let winnerId: string | null = null;
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

            // Fetch Stats
            const { count: groupsCreated } = await supabase
                .from('groups')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', userId);

            const stats: DashboardStats = {
                organized: groupsCreated || 0,
                participated: 0
            };

            setData({
                nextMatch,
                lastCraque,
                stats
            });
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            setError("Erro ao carregar dados do dashboard");
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refetch: fetchDashboardData };
}
