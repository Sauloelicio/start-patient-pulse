-- Add deleted_at column to patients table
ALTER TABLE public.patients 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance on soft-deleted queries
CREATE INDEX idx_patients_deleted_at ON public.patients(deleted_at);
CREATE INDEX idx_sessions_deleted_at ON public.sessions(deleted_at);

-- Update RLS policies to filter soft-deleted records
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can view sessions" ON public.sessions;

-- Recreate policies with soft delete filter
CREATE POLICY "Authenticated users can view active patients" 
ON public.patients 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can view active sessions" 
ON public.sessions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- Policy for admins to view deleted records
CREATE POLICY "Admins can view deleted patients" 
ON public.patients 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) AND deleted_at IS NOT NULL);

CREATE POLICY "Admins can view deleted sessions" 
ON public.sessions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) AND deleted_at IS NOT NULL);