CREATE OR REPLACE FUNCTION public.archive_patient(patient_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE archived_at timestamptz := now(); target_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'therapist')) THEN
    RAISE EXCEPTION 'Sem permissão para excluir pacientes' USING ERRCODE = '42501';
  END IF;
  SELECT id INTO target_id FROM public.patients WHERE id = patient_uuid AND deleted_at IS NULL FOR UPDATE;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Paciente não encontrado ou já excluído' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.sessions SET deleted_at = archived_at WHERE patient_id = patient_uuid AND deleted_at IS NULL;
  UPDATE public.patients SET deleted_at = archived_at WHERE id = patient_uuid;
  RETURN target_id;
END;
$$;
REVOKE ALL ON FUNCTION public.archive_patient(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_patient(uuid) TO authenticated;
COMMENT ON FUNCTION public.archive_patient(uuid) IS 'Atomically soft deletes a patient and active sessions after checking protected staff roles.';