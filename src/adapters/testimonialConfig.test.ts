import { describe, it, expect } from 'vitest';
import { testimonialSchema, testimonialConfig } from './testimonialConfig';
import { createRepository } from '../integrations/supabase/repository';

describe('Testimonial Config', () => {
  it('should have a valid Zod schema', () => {
    // RED: This test will fail because testimonialConfig doesn't exist yet
    
    // Assert: schema is defined
    expect(testimonialSchema).toBeDefined();
    
    // Assert: schema can validate valid data
    const validData = {
      client_name: 'John Doe',
      company: 'Acme Inc',
      content: 'Great service!',
      rating: 5,
    };
    
    const result = testimonialSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should have form field configurations', () => {
    // Assert: config has fields array
    expect(testimonialConfig.fields).toBeDefined();
    expect(testimonialConfig.fields.length).toBeGreaterThan(0);
    
    // Assert: required fields are present
    const fieldNames = testimonialConfig.fields.map(f => f.name);
    expect(fieldNames).toContain('client_name');
    expect(fieldNames).toContain('content');
  });

  it('should work with createRepository to create adapter', () => {
    // Arrange & Act: Create repository with testimonial config
    const testimonialRepo = createRepository(testimonialConfig);
    
    // Assert: Repository is created with correct hook methods
    expect(testimonialRepo).toBeDefined();
    expect(testimonialRepo.useFindAll).toBeDefined();
    expect(testimonialRepo.useFindById).toBeDefined();
    expect(testimonialRepo.useCreate).toBeDefined();
    expect(testimonialRepo.useUpdate).toBeDefined();
    expect(testimonialRepo.useDelete).toBeDefined();
  });
});
