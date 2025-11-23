-- ========================================
-- SISTEMA DE AUTENTICAÇÃO E SEGURANÇA LGPD
-- ========================================

-- 1. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Criar enum para tipos de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'therapist', 'receptionist');

-- 3. Criar tabela de roles de usuários
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role)
);

-- 4. Criar função de segurança para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Criar trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário')
  );
  
  -- Primeiro usuário é admin, demais são terapeutas
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 THEN 'admin'::app_role
      ELSE 'therapist'::app_role
    END
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- RLS POLICIES - PROTEÇÃO LGPD
-- ========================================

-- 6. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para PROFILES
DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow all operations on evaluations" ON public.evaluations;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 8. Políticas para USER_ROLES
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. Políticas para PATIENTS (apenas usuários autenticados)
CREATE POLICY "Authenticated users can view patients"
  ON public.patients FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Therapists and admins can insert patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Therapists and admins can update patients"
  ON public.patients FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Only admins can delete patients"
  ON public.patients FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. Políticas para SESSIONS (apenas usuários autenticados)
CREATE POLICY "Authenticated users can view sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Therapists and admins can insert sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Therapists and admins can update sessions"
  ON public.sessions FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Therapists and admins can delete sessions"
  ON public.sessions FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

-- 11. Políticas para EVALUATIONS (público pode inserir, staff pode ler)
CREATE POLICY "Anyone can insert evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view evaluations"
  ON public.evaluations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ========================================
-- STORAGE BUCKET - TORNAR PRIVADO
-- ========================================

-- 12. Atualizar bucket para privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'patient-photos';

-- 13. Políticas para STORAGE (apenas autenticados)
CREATE POLICY "Authenticated users can view patient photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-photos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Therapists and admins can upload patient photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-photos' AND
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Therapists and admins can update patient photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'patient-photos' AND
    auth.uid() IS NOT NULL AND (
      public.has_role(auth.uid(), 'therapist') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Only admins can delete patient photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'patient-photos' AND
    public.has_role(auth.uid(), 'admin')
  );

-- ========================================
-- TRIGGERS DE ATUALIZAÇÃO
-- ========================================

-- 14. Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();