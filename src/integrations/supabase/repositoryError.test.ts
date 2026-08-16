import { describe, expect, it } from 'vitest';
import { RepositoryError, asRepositoryError } from './repositoryError';

describe('RepositoryError', () => {
  it('names the table and operation that failed', () => {
    const error = new RepositoryError('create', 'courses', { message: 'duplicate key' });

    expect(error.message).toBe('courses.create failed: duplicate key');
    expect(error.table).toBe('courses');
    expect(error.operation).toBe('create');
    expect(error).toBeInstanceOf(Error);
  });

  it('keeps the underlying Postgrest error reachable for callers that need the code', () => {
    const cause = { message: 'row-level security', code: '42501' };
    const error = new RepositoryError('update', 'students', cause);

    expect(error.cause).toBe(cause);
    expect(error.code).toBe('42501');
  });

  it('survives an error with no message', () => {
    expect(new RepositoryError('delete', 'blogs', null).message).toBe('blogs.delete failed');
  });

  it('passes a RepositoryError straight through rather than double-wrapping', () => {
    const original = new RepositoryError('findAll', 'courses', { message: 'boom' });

    expect(asRepositoryError('findById', 'courses', original)).toBe(original);
  });

  it('wraps anything else', () => {
    const wrapped = asRepositoryError('findAll', 'webinars', { message: 'offline' });

    expect(wrapped).toBeInstanceOf(RepositoryError);
    expect(wrapped.message).toBe('webinars.findAll failed: offline');
  });
});
