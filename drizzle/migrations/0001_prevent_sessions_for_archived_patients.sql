CREATE OR REPLACE FUNCTION public.require_active_session_patient()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE archived timestamptz;
BEGIN
  IF NEW.deleted_at IS NOT NULL THEN RETURN NEW; END IF;
  SELECT deleted_at INTO archived FROM public.patients WHERE id = NEW.patient_id FOR UPDATE;
  IF NOT FOUND OR archived IS NOT NULL THEN
    RAISE EXCEPTION 'Não é possível registrar sessão para paciente excluído' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.require_active_session_patient() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER require_active_session_patient BEFORE INSERT OR UPDATE OF patient_id, deleted_at ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.require_active_session_patient();