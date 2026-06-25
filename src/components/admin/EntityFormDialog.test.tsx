import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityFormDialog } from './EntityFormDialog';
import { z } from 'zod';
import type { EntityConfig } from '@/adapters/entityConfigs';

// Tracer bullet: minimal config with one text field
const testConfig: EntityConfig<any> = {
  table: 'test_table',
  primaryKey: 'id',
  schema: z.object({ title: z.string().min(1) }),
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
  ],
  realtime: false,
};

describe('EntityFormDialog', () => {
  it('renders dialog with fields from config', () => {
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Should show dialog title (create mode = "Add")
    expect(screen.getByText(/add/i)).toBeInTheDocument();
    // Should render the field label
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('shows "Edit" in title when initialData is provided', () => {
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        initialData={{ id: '123', title: 'Existing' }}
      />
    );

    // Should show "Edit" in the dialog title
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // Find and click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('submits form with field values', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
        onSuccess={onSuccess}
      />
    );

    // Type into the title field using userEvent
    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Title');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Should call onSuccess after successful submission
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows validation error when required field is empty', async () => {
    const user = userEvent.setup();
    render(
      <EntityFormDialog
        config={testConfig}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Try to submit without filling required field
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Should show validation error
    expect(screen.getByText(/string must contain at least 1 character/i)).toBeInTheDocument();
  });

  it('renders select field with options', () => {
    const configWithSelect: EntityConfig<any> = {
      table: 'test_table',
      primaryKey: 'id',
      schema: z.object({ status: z.string() }),
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
      realtime: false,
    };

    render(
      <EntityFormDialog
        config={configWithSelect}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Should render a select element
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // Should show options
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders textarea field for long text', () => {
    const configWithTextarea: EntityConfig<any> = {
      table: 'test_table',
      primaryKey: 'id',
      schema: z.object({ description: z.string() }),
      fields: [
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
      ],
      realtime: false,
    };

    render(
      <EntityFormDialog
        config={configWithTextarea}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Should render a textarea element
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
  });

  it('renders checkbox field for boolean values', () => {
    const configWithCheckbox: EntityConfig<any> = {
      table: 'test_table',
      primaryKey: 'id',
      schema: z.object({ is_active: z.boolean() }),
      fields: [
        {
          name: 'is_active',
          label: 'Active',
          type: 'checkbox',
        },
      ],
      realtime: false,
    };

    render(
      <EntityFormDialog
        config={configWithCheckbox}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Should render a checkbox element
    expect(screen.getByRole('checkbox', { name: /active/i })).toBeInTheDocument();
  });
});
