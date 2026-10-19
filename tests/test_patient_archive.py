"""Authenticated integration checks: python3 -m unittest discover -s tests -v.

Requires the managed browser session. Creates only marked temporary records;
their IDs are saved under /tmp/browser/review for explicit cleanup.
"""
import json
import os
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


class PatientArchiveTests(unittest.TestCase):
    def setUp(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 1800})
        self.page = self.context.new_page()
        self.page.goto("http://localhost:8080")

    def tearDown(self):
        self.browser.close()
        self.playwright.stop()

    def test_unsigned_user_cannot_archive_patient(self):
        result = self.page.evaluate("""async () => {
          const { supabase } = await import('/src/integrations/supabase/client.ts');
          const { error } = await supabase.rpc('archive_patient', {
            patient_uuid: '00000000-0000-0000-0000-000000000000'
          });
          return { rejected: !!error, code: error?.code };
        }""")
        self.assertTrue(result["rejected"])
        self.assertEqual(result["code"], "42501")

    def test_authorized_patient_and_sessions_excluded_from_active_views(self):
        self.page.evaluate("([k,v])=>localStorage.setItem(k,v)", [
            os.environ["LOVABLE_BROWSER_SUPABASE_STORAGE_KEY"],
            os.environ["LOVABLE_BROWSER_SUPABASE_SESSION_JSON"],
        ])
        self.page.evaluate('localStorage.setItem("isAuthenticated","true")')
        self.page.goto("http://localhost:8080/patients/new")
        name = "TESTE TEMPORARIO EXCLUSAO VERIFICADA"
        for field, value in {
            "name": name, "phone": "11999999999", "pathology": "Teste de exclusão",
            "treatment_start_date": "2026-10-19", "session_package": "1 sessão",
        }.items():
            self.page.locator(f'[name="{field}"]').fill(value)
        self.page.get_by_role("button", name="Cadastrar Paciente").click()
        self.page.wait_for_url("**/patients")
        self.page.get_by_text(name, exact=True).click()
        self.page.wait_for_url("**/patients/*")
        patient_id = self.page.url.rsplit("/", 1)[1]
        Path("/tmp/browser/review").mkdir(parents=True, exist_ok=True)
        Path("/tmp/browser/review/verified_patient_id").write_text(patient_id)
        self.page.get_by_label("Data da Sessão").fill("2026-10-19")
        note = "Sessão temporária para verificar exclusão transacional."
        self.page.get_by_label("Evolução", exact=True).fill(note)
        self.page.get_by_role("button", name="Adicionar Sessão").click()
        self.page.get_by_text("Sessão registrada com sucesso!", exact=True).wait_for()
        self.page.on("dialog", lambda dialog: dialog.accept())
        self.page.get_by_role("button", name="Excluir Paciente").click()
        self.page.wait_for_url("**/patients")
        self.page.get_by_text("Pacientes", exact=True).wait_for()
        expect(self.page.get_by_text(name, exact=True)).to_have_count(0)
        result = self.page.evaluate("""async id => {
          const { supabase } = await import('/src/integrations/supabase/client.ts');
          const patients = await supabase.from('patients').select('id').eq('id',id).is('deleted_at',null);
          const sessions = await supabase.from('sessions').select('id').eq('patient_id',id).is('deleted_at',null);
          return {patients:patients.data, sessions:sessions.data, error:patients.error || sessions.error};
        }""", patient_id)
        self.assertIsNone(result["error"])
        self.assertEqual(result["patients"], [])
        self.assertEqual(result["sessions"], [])
        self.page.screenshot(path="/tmp/browser/review/archive_after.png")
        self.page.goto(f"http://localhost:8080/patients/{patient_id}")
        self.page.get_by_text("Paciente não encontrado", exact=True).wait_for()
        self.assertEqual(self.page.get_by_text(note, exact=True).count(), 0)
        blocked = self.page.evaluate("""async id => {
          const { supabase } = await import('/src/integrations/supabase/client.ts');
          const {error} = await supabase.from('sessions').insert({patient_id:id,
            session_date:'2026-10-19', evolution:'Tentativa de sessão após exclusão'});
          return error?.code;
        }""", patient_id)
        self.assertEqual(blocked, "23514")


if __name__ == "__main__":
    unittest.main()