import { describe, it, expect } from 'vitest';
import { certificationSchema, certificationConfig } from './entityConfigs';

describe('Certification Config', () => {
  it('should have a valid Zod schema', () => {
    // Assert: schema is defined
    expect(certificationSchema).toBeDefined();
    
    // Assert: schema can validate valid data
    const validData = {
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon',
      date: '2024-01-15',
      credential_url: 'https://aws.amazon.com/certification/',
    };
    
    const result = certificationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should have form field configurations', () => {
    // Assert: config has fields array
    expect(certificationConfig.fields).toBeDefined();
    expect(certificationConfig.fields.length).toBeGreaterThan(0);
    
    // Assert: required fields are present
    const fieldNames = certificationConfig.fields.map(f => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('issuer');
  });
});
