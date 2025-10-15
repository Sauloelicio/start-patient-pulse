-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pathology TEXT NOT NULL,
  treatment_start_date DATE NOT NULL,
  session_package TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required for clinic staff)
CREATE POLICY "Allow all operations on patients" 
ON public.patients 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create sessions table for tracking patient progress
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  evolution TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on sessions" 
ON public.sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create evaluations table for patient feedback
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on evaluations" 
ON public.evaluations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for patient photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public access to patient photos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'patient-photos')
WITH CHECK (bucket_id = 'patient-photos');