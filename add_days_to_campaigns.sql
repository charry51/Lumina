-- Migration: Add dias_semana to campanas
-- Allows selecting specific days of the week (0=Sunday, 1=Monday, ..., 6=Saturday)
ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS dias_semana INTEGER[] DEFAULT '{0,1,2,3,4,5,6}';

COMMENT ON COLUMN campanas.dias_semana IS 'Array of days of the week (0-6) when the campaign should be active.';
