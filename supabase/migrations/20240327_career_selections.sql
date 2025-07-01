-- Migration file: 20240327_career_selections.sql
-- Description: Add career_selections table for storing user career preferences

-- Create career_selections table
CREATE TABLE IF NOT EXISTS career_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_careers TEXT[] NOT NULL DEFAULT '{}',
    rejected_careers TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_career_selections_user_id ON career_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_career_selections_created_at ON career_selections(created_at);

-- Add trigger to update updated_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_career_selections_updated_at') THEN
        CREATE TRIGGER update_career_selections_updated_at
            BEFORE UPDATE ON career_selections
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 