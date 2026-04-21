-- 1. Create the support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'technical', 'billing', 'account'
    priority TEXT NOT NULL, -- 'baja', 'media', 'alta'
    status TEXT NOT NULL DEFAULT 'abierto', -- 'abierto', 'en_progreso', 'cerrado'
    admin_reply TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Toggle RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own tickets
CREATE POLICY "Users can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all tickets (Assuming 'superadmin' role from perfiles)
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE perfiles.id = auth.uid() AND perfiles.rol = 'superadmin'
  )
);

-- Policy: Admins can update tickets
CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE perfiles.id = auth.uid() AND perfiles.rol = 'superadmin'
  )
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_support_tickets_modtime ON public.support_tickets;

CREATE TRIGGER update_support_tickets_modtime
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();


-- 2. Storage Setup for Attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('support_attachments', 'support_attachments', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can insert attachments if they are authenticated
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'support_attachments');

-- Storage Policy: Anyone can read (since it's a public bucket, or we can restrict it to authenticated users)
CREATE POLICY "Anyone can view attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'support_attachments');
