import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// The learner's own profile, and the public view of anyone's.
//
// The public profile is an acquisition surface, so it is readable without an
// account — but submissions are owner-scoped, so a visitor cannot read another
// learner's rows directly. `public_profile()` returns aggregates only, and never
// raw submitted code.

export interface OwnProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  is_public: boolean;
  timezone: string;
  target_industry: string | null;
}

export function useOwnProfile() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['own-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, username, display_name, is_public, timezone, target_industry')
        .eq('id', userId)
        .maybeSingle();
      if (error) return null;
      return (data ?? null) as OwnProfile | null;
    },
  });

  const save = useMutation({
    mutationFn: async (patch: Partial<OwnProfile>) => {
      if (!userId) throw new Error('Not signed in');
      // Upsert: an anonymous learner has no profile row until they claim a name.
      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({ id: userId, ...patch }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });

  return { profile: data ?? null, loading: isLoading, save };
}

export interface PublicProfile {
  username: string;
  is_public: boolean;
  display_name?: string;
  joined_at?: string;
  xp?: number;
  solve_dates?: string[];
  solved?: { title: string; difficulty: string; industry: string }[];
  certificates?: { id: string; title: string; issued_at: string; status: string }[];
  roadmaps_completed?: string[];
}

export function usePublicProfile(username?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['public-profile', username],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('public_profile', {
        p_username: username,
      });
      if (error) return null;
      return (data ?? null) as PublicProfile | null;
    },
  });
  return { profile: data ?? null, loading: isLoading };
}
