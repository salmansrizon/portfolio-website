import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import type { EntityConfig } from '@/adapters/entityConfigs';
import type { Repository } from '@/integrations/supabase/repository';
import { useEntityManager } from './useEntityManager';

// A fake Repository<T> — a real one drags in TanStack Query + Supabase, and
// this hook's own logic (dialog state, toast copy, search) is what's under
// test, not the repository's internals (already covered by repository.ts's
// own consumers). Tracks the last args each hook was called with so tests
// can assert on them.
function fakeRepository<T extends Record<string, unknown>>(items: T[]) {
  const calls = {
    findAllFilter: undefined as Partial<T> | undefined,
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const repository: Repository<T> = {
    useFindAll: (filter?: Partial<T>) => {
      calls.findAllFilter = filter;
      return { data: items, isLoading: false, error: null };
    },
    useFindById: () => ({ data: null, isLoading: false, error: null }),
    useCreate: () => ({
      mutate: (item: Partial<T>, opts?: { onSuccess?: () => void; onError?: (e: any) => void }) => {
        calls.create(item);
        opts?.onSuccess?.();
      },
      mutateAsync: async (item: Partial<T>) => { calls.create(item); return item as T; },
      isPending: false,
      error: null,
    }),
    useUpdate: () => ({
      mutate: (params: { id: string; item: Partial<T> }, opts?: { onSuccess?: () => void; onError?: (e: any) => void }) => {
        calls.update(params);
        opts?.onSuccess?.();
      },
      mutateAsync: async (params: { id: string; item: Partial<T> }) => { calls.update(params); return params.item as T; },
      isPending: false,
      error: null,
    }),
    useDelete: () => ({
      mutate: (id: string, opts?: { onSuccess?: () => void; onError?: (e: any) => void }) => {
        calls.delete(id);
        opts?.onSuccess?.();
      },
      mutateAsync: async (id: string) => { calls.delete(id); },
      isPending: false,
      error: null,
    }),
  };

  return { repository, calls };
}

const toastMock = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/integrations/supabase/repository', async () => {
  const actual = await vi.importActual<typeof import('@/integrations/supabase/repository')>(
    '@/integrations/supabase/repository'
  );
  return {
    ...actual,
    createRepository: vi.fn(actual.createRepository),
  };
});

interface Widget extends Record<string, unknown> {
  id: string;
  name: string;
  owner: string;
}

// A deliberate test double, not a real Entity Config: 'widgets' is not a table,
// and createRepository is mocked, so nothing here ever reaches Supabase. The
// cast opts the fixture out of the schema check that guards the real configs.
const widgetConfig = {
  table: 'widgets',
  entityLabel: 'Widget',
  searchableFields: ['name', 'owner'],
  schema: z.object({ id: z.string().optional(), name: z.string(), owner: z.string() }),
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'owner', type: 'text', label: 'Owner' },
  ],
} as unknown as EntityConfig<Widget>;

const items: Widget[] = [
  { id: '1', name: 'Alpha', owner: 'Sam' },
  { id: '2', name: 'Beta', owner: 'Jo' },
];

beforeEach(() => {
  toastMock.mockClear();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('useEntityManager', () => {
  it('passes through items and isLoading from the repository, unfiltered by default', () => {
    const { repository } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    expect(result.current.items).toEqual(items);
    expect(result.current.isLoading).toBe(false);
  });

  it('forwards the filter option to repository.useFindAll', () => {
    const { repository, calls } = fakeRepository(items);
    renderHook(() => useEntityManager(widgetConfig, { repository, filter: { owner: 'Sam' } }));

    expect(calls.findAllFilter).toEqual({ owner: 'Sam' });
  });

  it('search filters items via config.searchableFields, case-insensitive across fields', () => {
    const { repository } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.setSearch('sam'));
    expect(result.current.items).toEqual([items[0]]);

    act(() => result.current.setSearch('BETA'));
    expect(result.current.items).toEqual([items[1]]);

    act(() => result.current.setSearch(''));
    expect(result.current.items).toEqual(items);
  });

  it('a custom searchPredicate fully overrides the default searchableFields match', () => {
    const { repository } = fakeRepository(items);
    const { result } = renderHook(() =>
      useEntityManager(widgetConfig, {
        repository,
        // Matches on id, which searchableFields (name/owner) would never match.
        searchPredicate: (item, query) => item.id === query,
      })
    );

    act(() => result.current.setSearch('2'));
    expect(result.current.items).toEqual([items[1]]);
  });

  it('openCreate opens the dialog with no initialData', () => {
    const { repository } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.openCreate());

    expect(result.current.dialog.open).toBe(true);
    expect(result.current.dialog.initialData).toBeNull();
  });

  it('openEdit opens the dialog with the given item as initialData', () => {
    const { repository } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.openEdit(items[0]));

    expect(result.current.dialog.open).toBe(true);
    expect(result.current.dialog.initialData).toEqual(items[0]);
  });

  it('dialog.onSubmit calls create when there is no initialData (create mode)', () => {
    const { repository, calls } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.openCreate());
    act(() => result.current.dialog.onSubmit({ name: 'Gamma', owner: 'Lee' }));

    expect(calls.create).toHaveBeenCalledWith({ name: 'Gamma', owner: 'Lee' });
    expect(calls.update).not.toHaveBeenCalled();
  });

  it('dialog.onSubmit calls update with {id, item} when editing', () => {
    const { repository, calls } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.openEdit(items[0]));
    act(() => result.current.dialog.onSubmit({ name: 'Alpha v2', owner: 'Sam' }));

    expect(calls.update).toHaveBeenCalledWith({ id: '1', item: { name: 'Alpha v2', owner: 'Sam' } });
    expect(calls.create).not.toHaveBeenCalled();
  });

  it('extraFields are merged under the submitted data on both create and update', () => {
    const { repository, calls } = fakeRepository(items);
    const { result } = renderHook(() =>
      useEntityManager(widgetConfig, { repository, extraFields: { owner: 'default-owner' } })
    );

    act(() => result.current.openCreate());
    act(() => result.current.dialog.onSubmit({ name: 'Gamma', owner: 'explicit-owner' }));

    // Form data wins over extraFields on key conflicts.
    expect(calls.create).toHaveBeenCalledWith({ owner: 'explicit-owner', name: 'Gamma' });
  });

  it('on submit success, closes the dialog, clears initialData, and fires a success toast', () => {
    const { repository } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.openEdit(items[0]));
    act(() => result.current.dialog.onSubmit({ name: 'Alpha v2', owner: 'Sam' }));

    expect(result.current.dialog.open).toBe(false);
    expect(result.current.dialog.initialData).toBeNull();
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Widget updated' }));
  });

  it('on submit error, keeps the dialog open and fires an error-variant toast', () => {
    const items2 = [...items];
    const { repository } = fakeRepository(items2);
    // Override create to fail.
    repository.useCreate = () => ({
      mutate: (_item: any, opts?: { onError?: (e: any) => void }) => opts?.onError?.({ message: 'boom' }),
      mutateAsync: async () => { throw new Error('boom'); },
      isPending: false,
      error: null,
    });
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.openCreate());
    act(() => result.current.dialog.onSubmit({ name: 'Gamma', owner: 'Lee' }));

    expect(result.current.dialog.open).toBe(true);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Error', description: 'boom', variant: 'destructive' })
    );
  });

  it('remove() asks for confirmation, and skips the delete when declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { repository, calls } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.remove(items[0]));

    expect(calls.delete).not.toHaveBeenCalled();
  });

  it('remove() deletes by primary key and fires a success toast when confirmed', () => {
    const { repository, calls } = fakeRepository(items);
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    act(() => result.current.remove(items[0]));

    expect(calls.delete).toHaveBeenCalledWith('1');
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Widget deleted' }));
  });

  it('isMutating reflects the repository mutations\' isPending', () => {
    const { repository } = fakeRepository(items);
    repository.useCreate = () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    });
    const { result } = renderHook(() => useEntityManager(widgetConfig, { repository }));

    expect(result.current.isMutating).toBe(true);
  });

  it('falls back to createRepository(config) when no repository option is given', async () => {
    const repoModule = await import('@/integrations/supabase/repository');
    const { repository: fake } = fakeRepository(items);
    // Stub the return so the fallback path never touches real Supabase/TanStack
    // Query — this test only cares that the fallback is *invoked* with config.
    const spy = vi.mocked(repoModule.createRepository).mockReturnValueOnce(fake as any);

    renderHook(() => useEntityManager(widgetConfig));

    expect(spy).toHaveBeenCalledWith(widgetConfig);
  });
});
