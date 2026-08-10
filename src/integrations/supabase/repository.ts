import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client';
import type { EntityConfig } from '@/adapters/entityConfigs';

// ── Generic Repository Interface ──────────────────────────────────────────────
// This is the seam between components and data sources.
// Implementations: SupabaseRepository (prod), InMemoryRepository (tests).
//
// Uses TanStack Query hooks (aligned with Candidate #1's CRUD adapter pattern).

export interface Repository<T extends Record<string, unknown>> {
  // ── Query hooks ──────────────────────────────────────────────────────
  useFindAll(filter?: Partial<T>): {
    data: T[];
    isLoading: boolean;
    error: any;
  };
  useFindById(id: string): {
    data: T | null;
    isLoading: boolean;
    error: any;
  };
  useFindByFilter(filter: Partial<T>): {
    data: T[];
    isLoading: boolean;
    error: any;
  };

  // ── Mutation hooks ─────────────────────────────────────────────────────
  useCreate(): {
    mutate: (item: Partial<T>) => void;
    mutateAsync: (item: Partial<T>) => Promise<T>;
    isPending: boolean;
    error: any;
  };
  useUpdate(): {
    mutate: (params: { id: string; item: Partial<T> }) => void;
    mutateAsync: (params: { id: string; item: Partial<T> }) => Promise<T>;
    isPending: boolean;
    error: any;
  };
  useDelete(): {
    mutate: (id: string) => void;
    mutateAsync: (id: string) => Promise<void>;
    isPending: boolean;
    error: any;
  };
}

// ── Supabase Repository Implementation ──────────────────────────────────────
// Implements Repository<T> using the Supabase client.
// Uses TanStack Query for caching, loading, and error state.

export function createRepository<T extends Record<string, unknown>>(
  config: EntityConfig<T>
) {
  const { table, primaryKey = 'id' } = config;

  // ── Query hooks ──────────────────────────────────────────────────────
  function useFindAll(filter?: Partial<T>) {
    // An empty-string filter value (e.g. a master-detail screen before its
    // "master" selection is made) can never match a real row and, for
    // UUID/foreign-key columns, Postgrest rejects `eq.<empty>` outright with
    // a 400 — so skip the fetch entirely rather than firing a doomed query.
    const hasEmptyFilterValue = filter != null && Object.values(filter).some((value) => value === '');

    return useQuery({
      queryKey: [table, filter],
      queryFn: async () => {
        let query = supabase.from(table).select('*');

        // Apply filter if provided
        if (filter) {
          for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined) {
              query = query.eq(key, value as any);
            }
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as T[];
      },
      enabled: !hasEmptyFilterValue,
    });
  }

  function useFindById(id: string) {
    return useQuery({
      queryKey: [table, id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(primaryKey, id)
          .single();
        if (error) throw error;
        return data as T;
      },
      enabled: !!id,
    });
  }

  function useFindByFilter(filter: Partial<T>) {
    return useFindAll(filter);
  }

  // ── Mutation hooks ─────────────────────────────────────────────────────
  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (item: Partial<T>) => {
        const { data, error } = await supabase
          .from(table)
          .insert(item)
          .select()
          .single();
        if (error) throw error;
        return data as T;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] });
      },
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, item }: { id: string; item: Partial<T> }) => {
        const { data, error } = await supabase
          .from(table)
          .update(item)
          .eq(primaryKey, id)
          .select()
          .single();
        if (error) throw error;
        return data as T;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] });
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(primaryKey, id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] });
      },
    });
  }

  return {
    useFindAll,
    useFindById,
    useFindByFilter,
    useCreate,
    useUpdate,
    useDelete,
  };
}
