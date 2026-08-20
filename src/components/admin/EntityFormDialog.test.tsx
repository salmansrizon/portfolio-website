import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityFormDialog } from './EntityFormDialog';
import { z } from 'zod';
import type { FormConfig } from '@/adapters/entityConfigs';

// Radix Select/Switch need a few DOM APIs jsdom doesn't implement.
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (typeof (globalThis as any).ResizeObserver === 'undefined') {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// Tracer bullet: minimal config with one text field
const testConfig: FormConfig<any> = {
  entityLabel: 'Widget',
  schema: z.object({ title: z.string().min(1) }),
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
  ],
};

describe('EntityFormDialog', () => {
  it('renders dialog with fields from config', () => {
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
      />
    );

    // Create mode = "Add {entityLabel}"
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('shows "Edit {entityLabel}" when initialData is provided', () => {
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{ id: '123', title: 'Existing' }}
      />
    );

    expect(screen.getByText('Edit Widget')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('submits form with field values via onSubmit, not onOpenChange', async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText('Title'), 'Test Title');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Title' }));
    // The dialog is a pure form shell — closing on success is the caller's job.
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('shows validation error when required field is empty', async () => {
    const user = userEvent.setup();
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(screen.getByText(/string must contain at least 1 character/i)).toBeInTheDocument();
  });

  it('renders and submits a boolean field as a real boolean', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ is_active: z.boolean().default(false) }),
      fields: [{ name: 'is_active', label: 'Active', type: 'boolean' }],
    };

    render(
      <EntityFormDialog config={config} open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    );

    const toggle = screen.getByRole('switch', { name: /active/i });
    expect(toggle).toBeInTheDocument();
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ is_active: true }));
  });

  it('round-trips an array field through a newline-separated textarea', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ items: z.array(z.string()).default([]) }),
      fields: [{ name: 'items', label: 'Items', type: 'array' }],
    };

    render(
      <EntityFormDialog config={config} open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText('Items'), 'a{enter}b{enter}c');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ items: ['a', 'b', 'c'] }));
  });

  it('pre-fills an array field as newline-joined text when editing', () => {
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ items: z.array(z.string()).default([]) }),
      fields: [{ name: 'items', label: 'Items', type: 'array' }],
    };

    render(
      <EntityFormDialog
        config={config}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{ id: '1', items: ['x', 'y'] }}
      />
    );

    expect(screen.getByLabelText('Items')).toHaveValue('x\ny');
  });

  it('renders select field with options and submits the selected value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const configWithSelect: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ status: z.string().default('active') }),
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      ],
    };

    render(
      <EntityFormDialog
        config={configWithSelect}
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
        initialData={{ id: '1', status: 'inactive' }}
      />
    );

    // Radix Select's popper content doesn't reliably mount/measure under jsdom,
    // so this exercises the Controller wiring end-to-end via the pre-selected
    // value (from initialData) rather than simulating a dropdown click.
    expect(screen.getByRole('combobox')).toHaveTextContent('Inactive');

    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: 'inactive' }));
  });

  it('renders a multiselect as checkboxes and submits the selection as string[]', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ tags: z.array(z.string()).default([]) }),
      fields: [
        {
          name: 'tags',
          label: 'Tags',
          type: 'multiselect',
          options: [
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
          ],
        },
      ],
    };

    render(
      <EntityFormDialog config={config} open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tags: ['react'] }));
  });

  it('unchecking a multiselect option removes it from the submitted array', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ tags: z.array(z.string()).default([]) }),
      fields: [
        {
          name: 'tags',
          label: 'Tags',
          type: 'multiselect',
          options: [
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
          ],
        },
      ],
    };

    render(
      <EntityFormDialog
        config={config}
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
        initialData={{ id: '1', tags: ['react', 'vue'] }}
      />
    );

    expect(screen.getByRole('checkbox', { name: 'React' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tags: ['vue'] }));
  });

  it('dynamicOptions overrides a select/multiselect field\'s static options', () => {
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ tags: z.array(z.string()).default([]) }),
      fields: [{ name: 'tags', label: 'Tags', type: 'multiselect', options: [] }],
    };

    render(
      <EntityFormDialog
        config={config}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        dynamicOptions={{ tags: [{ label: 'Runtime Option', value: 'runtime' }] }}
      />
    );

    expect(screen.getByRole('checkbox', { name: 'Runtime Option' })).toBeInTheDocument();
  });

  it('a nullable select field shows a None option and displays it by default', () => {
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ parent_id: z.string().uuid().nullable().optional() }),
      fields: [
        {
          name: 'parent_id',
          label: 'Parent',
          type: 'select',
          options: [{ label: 'Category A', value: '11111111-1111-1111-1111-111111111111' }],
        },
      ],
    };

    render(
      <EntityFormDialog config={config} open={true} onOpenChange={() => {}} onSubmit={() => {}} />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('None');
  });

  it('a nullable select field pre-filled with a real value does not show None as selected', () => {
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ parent_id: z.string().uuid().nullable().optional() }),
      fields: [
        {
          name: 'parent_id',
          label: 'Parent',
          type: 'select',
          options: [{ label: 'Category A', value: '11111111-1111-1111-1111-111111111111' }],
        },
      ],
    };

    render(
      <EntityFormDialog
        config={config}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{ id: '1', parent_id: '11111111-1111-1111-1111-111111111111' }}
      />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Category A');
  });

  it('does not add a None option to a non-nullable select (no regression on existing selects)', () => {
    const config: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ status: z.string().default('draft') }),
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
        },
      ],
    };

    render(
      <EntityFormDialog config={config} open={true} onOpenChange={() => {}} onSubmit={() => {}} />
    );

    expect(screen.queryByText('None')).not.toBeInTheDocument();
  });

  it('renders textarea field for long text', () => {
    const configWithTextarea: FormConfig<any> = {
      entityLabel: 'Widget',
      schema: z.object({ description: z.string() }),
      fields: [{ name: 'description', label: 'Description', type: 'textarea' }],
    };

    render(
      <EntityFormDialog config={configWithTextarea} open={true} onOpenChange={() => {}} onSubmit={() => {}} />
    );

    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
  });

  it('resets to the new item\'s values when initialData changes while open', () => {
    const { rerender } = render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{ id: 'a', title: 'First' }}
      />
    );

    expect(screen.getByLabelText('Title')).toHaveValue('First');

    rerender(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{ id: 'b', title: 'Second' }}
      />
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Second');
  });
});
