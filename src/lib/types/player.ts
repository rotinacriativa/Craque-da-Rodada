// Player-facing types for Craque da Rodada

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio?: string;
  phone?: string;
  birth_date?: string;
  marital_status?: string;
  has_children?: boolean;
  state?: string;
  city?: string;
  position?: string;
  dominant_foot?: string;
  jersey_number?: string;
  skill_level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  image_url?: string;
  location?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  price: number;
  capacity: number;
  group_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  user_id: string;
  status: 'confirmed' | 'waitlist' | 'declined';
  team: 'A' | 'B' | null;
  created_at?: string;
}

export interface ParticipantWithProfile extends MatchParticipant {
  profile: Profile;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'inactive';
  joined_at: string;
}

export interface GroupMemberWithProfile extends GroupMember {
  profile: Profile;
}

export interface Vote {
  id?: string;
  match_id: string;
  voter_id: string;
  voted_user_id: string;
  category: 'craque' | 'bagre';
  created_at?: string;
}

export interface VoteResult {
  userId: string;
  count: number;
  user: ParticipantWithProfile;
}

// Dashboard specific types
export interface DashboardStats {
  organized: number;
  participated: number;
  goals?: number;
}

export interface NextMatchData {
  match: Match;
  group: Group;
  participants: Profile[];
}

export interface LastCraque {
  full_name: string;
  avatar_url: string | null;
  votes: number;
}

export interface DashboardData {
  nextMatch: NextMatchData | null;
  lastCraque: LastCraque | null;
  stats: DashboardStats;
}

// Group details specific types
export interface GroupDetailsData {
  group: Group;
  matches: Match[];
  members: GroupMemberWithProfile[];
  userRole: 'owner' | 'admin' | 'member' | null;
}

// Match details specific types
export interface MatchDetailsData {
  match: Match;
  groupName: string;
  participants: ParticipantWithProfile[];
  isAdmin: boolean;
  myVote: Vote | null;
  voteResults: VoteResult[] | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}
