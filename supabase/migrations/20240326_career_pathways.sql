-- Migration file: 20240326_career_pathways.sql
-- Description: Add career_pathways table without foreign key constraints on arrays

-- Drop the career_pathways table if it exists (to remove any existing FK constraints)
DROP TABLE IF EXISTS career_pathways;

-- Create career_pathways table without foreign key constraints on array columns
CREATE TABLE career_pathways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    related_career_ids UUID[], -- Array of career IDs (no FK constraint)
    recommended_subjects UUID[], -- Array of subject IDs (no FK constraint)
    education_level TEXT, -- e.g., "Bachelor", "Diploma", "Certificate"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_career_pathways_title ON career_pathways(title);
CREATE INDEX idx_career_pathways_education_level ON career_pathways(education_level);

-- Add trigger to update updated_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_career_pathways_updated_at') THEN
        CREATE TRIGGER update_career_pathways_updated_at
            BEFORE UPDATE ON career_pathways
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 