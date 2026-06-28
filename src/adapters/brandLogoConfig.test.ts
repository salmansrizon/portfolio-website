import { describe, it, expect } from 'vitest';
import { brandLogoSchema, brandLogoConfig } from './entityConfigs';

describe('BrandLogo Config', () => {
  it('should have a valid Zod schema', () => {
    // Assert: schema is defined
    expect(brandLogoSchema).toBeDefined();
    
    // Assert: schema can validate valid data
    const validData = {
      name: 'Microsoft',
      logo_url: 'https://example.com/logo.png',
      website_url: 'https://microsoft.com',
    };
    
    const result = brandLogoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should have form field configurations', () => {
    // Assert: config has fields array
    expect(brandLogoConfig.fields).toBeDefined();
    expect(brandLogoConfig.fields.length).toBeGreaterThan(0);
    
    // Assert: required fields are present
    const fieldNames = brandLogoConfig.fields.map(f => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('logo_url');
  });
});
