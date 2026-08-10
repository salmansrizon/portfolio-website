import { useCallback, useMemo, useState } from 'react';
import type { EntityConfig } from '@/adapters/entityConfigs';
import { createRepository, type Repository } from '@/integrations/supabase/repository';
import { useToast } from '@/hooks/use-toast';

// ── useEntityManager ─────────────────────────────────────────────────────────
// The deep module behind a flat single-entity CRUD admin screen: owns dialog
// open/create/edit state, toast-on-success/error, delete confirmation, and
// search/filter — on top of the repository seam. Returns data + handlers only;
// it never renders the list (cards/tables/trees stay hand-rolled per screen).
//
// `dialog` is shaped exactly like EntityFormDialog's props (minus `config`),
// so the common case is `<EntityFormDialog config={x} {...dialog} />`. A
// Manager with a bespoke form (rich editor, nested block builder, a form with
// widgets no generic field type can express) can instead render its own
// dialog wired to `dialog.open`/`dialog.onOpenChange`/`dialog.initialData`
// and call `dialog.onSubmit(myOwnData)` directly — the hook doesn't care who
// builds the payload, only that create-vs-update, the toast, and closing the
// dialog happen consistently.

export interface UseEntityManagerOptions<T extends Record<string, unknown>> {
  // Injection seam for tests — production callers omit this and get
  // createRepository(config).
  repository?: Repository<T>;
  // Forwarded to repository.useFindAll(filter) — for master-detail screens
  // (e.g. course content scoped to a selected course).
  filter?: Partial<T>;
  // Merged under the form's own data on every create/update
  // ({ ...extraFields, ...data }) — for fields the form doesn't collect but
  // every write still needs (e.g. { course_id: selectedCourse }).
  extraFields?: Partial<T>;
  // Overrides config.searchableFields' default substring match entirely —
  // for search that needs joined/computed data a plain per-field match can't
  // express (e.g. matching against a related record's title).
  searchPredicate?: (item: T, query: string) => boolean;
}

export interface UseEntityManagerResult<T extends Record<string, unknown>> {
  items: T[];
  isLoading: boolean;
  isMutating: boolean;

  search: string;
  setSearch: (query: string) => void;

  openCreate: () => void;
  openEdit: (item: T) => void;
  remove: (item: T) => void;

  dialog: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: T | null;
    onSubmit: (data: Partial<T>) => void;
  };
}

export function useEntityManager<T extends Record<string, unknown>>(
  config: EntityConfig<T>,
  options?: UseEntityManagerOptions<T>
): UseEntityManagerResult<T> {
  const repository = options?.repository ?? createRepository(config);
  const { toast } = useToast();
  const primaryKey = (config.primaryKey ?? 'id') as keyof T;

  const { data: items = [], isLoading } = repository.useFindAll(options?.filter);
  const createMutation = repository.useCreate();
  const updateMutation = repository.useUpdate();
  const deleteMutation = repository.useDelete();

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [search, setSearch] = useState('');

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setOpen(true);
  }, []);

  const onSubmit = useCallback(
    (data: Partial<T>) => {
      const payload = { ...options?.extraFields, ...data } as Partial<T>;
      const isEdit = editingItem != null;

      const onSuccess = () => {
        toast({ title: `${config.entityLabel} ${isEdit ? 'updated' : 'created'}` });
        setOpen(false);
        setEditingItem(null);
      };
      const onError = (error: any) => {
        toast({
          title: 'Error',
          description: error?.message || `Failed to ${isEdit ? 'update' : 'create'} ${config.entityLabel.toLowerCase()}.`,
          variant: 'destructive',
        });
      };

      if (isEdit) {
        const id = (editingItem as T)[primaryKey] as unknown as string;
        updateMutation.mutate({ id, item: payload }, { onSuccess, onError });
      } else {
        createMutation.mutate(payload, { onSuccess, onError });
      }
    },
    [editingItem, options?.extraFields, config.entityLabel, primaryKey, updateMutation, createMutation, toast]
  );

  const remove = useCallback(
    (item: T) => {
      if (!window.confirm(`Delete this ${config.entityLabel.toLowerCase()}?`)) return;
      const id = item[primaryKey] as unknown as string;
      deleteMutation.mutate(id, {
        onSuccess: () => toast({ title: `${config.entityLabel} deleted` }),
        onError: (error: any) =>
          toast({
            title: 'Error',
            description: error?.message || `Failed to delete ${config.entityLabel.toLowerCase()}.`,
            variant: 'destructive',
          }),
      });
    },
    [config.entityLabel, primaryKey, deleteMutation, toast]
  );

  const filteredItems = useMemo(() => {
    if (!search) return items;
    if (options?.searchPredicate) {
      const predicate = options.searchPredicate;
      return items.filter((item) => predicate(item, search));
    }
    const fields = config.searchableFields ?? [];
    if (fields.length === 0) return items;
    const query = search.toLowerCase();
    return items.filter((item) =>
      fields.some((field) => String(item[field] ?? '').toLowerCase().includes(query))
    );
  }, [items, search, options?.searchPredicate, config.searchableFields]);

  return {
    items: filteredItems,
    isLoading,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    search,
    setSearch,
    openCreate,
    openEdit,
    remove,
    dialog: {
      open,
      onOpenChange: setOpen,
      initialData: editingItem,
      onSubmit,
    },
  };
}
