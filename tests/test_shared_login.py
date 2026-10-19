"""Shared login integration checks; TEST_LOGIN_PASSWORD is supplied securely at runtime."""
import os
import unittest
from playwright.sync_api import sync_playwright


class SharedLoginTests(unittest.TestCase):
    def test_password_authenticates_and_invalid_password_is_rejected(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 1800})
            page.goto("http://localhost:8080/login")
            rejected = page.evaluate("""async () => {
                const {supabase} = await import('/src/integrations/supabase/client.ts');
                const {data, error} = await supabase.functions.invoke('shared-login', {
                  body: {password: 'intentionally-invalid-test-password'}
                });
                return {status: error?.context?.status, session: !!data?.session};
            }""")
            self.assertEqual(rejected["status"], 401)
            self.assertFalse(rejected["session"])
            page.get_by_placeholder("Digite a senha de acesso").fill(os.environ["TEST_LOGIN_PASSWORD"])
            page.get_by_role("button", name="Acessar Sistema").click()
            page.wait_for_url("http://localhost:8080/", timeout=30000)
            page.goto("http://localhost:8080/patients")
            page.get_by_role("heading", name="Pacientes", exact=True).wait_for()
            self.assertTrue(page.evaluate("""async () => {
                const {supabase} = await import('/src/integrations/supabase/client.ts');
                const {data, error} = await supabase.from('patients').select('id').is('deleted_at',null).limit(1);
                return !error && Array.isArray(data);
            }"""))
            page.evaluate("""async () => {
                const {supabase} = await import('/src/integrations/supabase/client.ts');
                await supabase.auth.signOut();
            }""")
            browser.close()