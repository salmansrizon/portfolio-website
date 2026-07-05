import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UseAdminResourceOptions {
  table: string;
  orderBy: { column: string; ascending?: boolean };
}

export interface UseAdminResourceResult<T> {
  items: T[];
  loading: boolean;
  saving: boolean;
  editingItem: T | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  startCreate: () => void;
  startEdit: (item: T) => void;
  clearEditing: () => void;
  save: (payload: Record<string, unknown>) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * One deep hook owning fetch → dialog state → insert/update branch → delete →
 * toasts for the admin panel's template-shaped managers. `resourceTable()` is
 * the one place that casts a table name past the generated Supabase types —
 * callers never touch `as any` themselves.
 */
export function useAdminResource<T extends { id: string }>({
  table,
  orderBy,
}: UseAdminResourceOptions): UseAdminResourceResult<T> {
  const { toast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resourceTable = useCallback(() => supabase.from(table as any) as any, [table]);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await resourceTable()
        .select("*")
        .order(orderBy.column, { ascending: orderBy.ascending ?? true });
      if (error) throw error;
      setItems((data || []) as T[]);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [resourceTable, orderBy.column, orderBy.ascending, toast]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderBy.column, orderBy.ascending]);

  const startCreate = useCallback(() => {
    setEditingItem(null);
    setIsDialogOpen(true);
  }, []);

  /** Clears the edit target without forcing the dialog open — for managers that reset on dialog close rather than on trigger click. */
  const clearEditing = useCallback(() => {
    setEditingItem(null);
  }, []);

  const startEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const save = useCallback(
    async (payload: Record<string, unknown>): Promise<boolean> => {
      setSaving(true);
      try {
        if (editingItem) {
          const { error } = await resourceTable().update(payload).eq("id", editingItem.id);
          if (error) throw error;
          toast({ title: "Success", description: "Updated successfully!" });
        } else {
          const { error } = await resourceTable().insert(payload);
          if (error) throw error;
          toast({ title: "Success", description: "Created successfully!" });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
        await refresh();
        return true;
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "Failed to save", variant: "destructive" });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [editingItem, resourceTable, refresh, toast],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        const { error } = await resourceTable().delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Deleted", description: "Removed successfully." });
        await refresh();
      } catch (error: any) {
        toast({ title: "Error", description: error?.message || "Failed to delete", variant: "destructive" });
      }
    },
    [resourceTable, refresh, toast],
  );

  return {
    items,
    loading,
    saving,
    editingItem,
    isDialogOpen,
    setIsDialogOpen,
    startCreate,
    startEdit,
    clearEditing,
    save,
    remove,
    refresh,
  };
}
