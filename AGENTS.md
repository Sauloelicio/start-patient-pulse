# Architecture rules
- Archive patients through the authenticated `archive_patient` database function so role checks and patient/session updates occur in a single transaction; never replace this with separate client updates.
- Active patient lists and clinical timelines explicitly filter archived rows so administrator visibility cannot reintroduce excluded patients into the active workflow.
- Session writes lock and validate the parent patient in a database trigger to prevent new active sessions racing with patient archival.
- Shared-password login validates the secret and authenticates the existing account only in the shared-login function; never ship access or account passwords in browser code, because browser bundles are public.