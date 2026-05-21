-- Add new columns to portfolio_sections table for enhanced section management

ALTER TABLE portfolio_sections
ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published')),
ADD COLUMN section_type text DEFAULT 'predefined' CHECK (section_type IN ('predefined', 'custom')),
ADD COLUMN custom_fields jsonb,
ADD COLUMN order_index integer;

-- Create index for status and section_type queries
CREATE INDEX idx_portfolio_sections_status ON portfolio_sections(status);
CREATE INDEX idx_portfolio_sections_section_type ON portfolio_sections(section_type);
CREATE INDEX idx_portfolio_sections_order ON portfolio_sections(order_index);

-- Update existing records to have default values
UPDATE portfolio_sections SET status = 'published' WHERE status IS NULL;
UPDATE portfolio_sections SET section_type = 'predefined' WHERE section_type IS NULL;
