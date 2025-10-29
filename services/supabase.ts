
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://otyxjcxxqwjotnuyrvmc.supabase.co";
// This key is safe to be exposed in a browser environment.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eXhqY3h4cXdqb3RudXlydm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzU5MTQsImV4cCI6MjA3MzAxMTkxNH0.O6pWtKMQvsIQlOt7G6nIcDMMKoTJU-G-qpZiiE6Q3Hk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getRedirectUrl() {
    // In a real Capacitor app, you might have different logic.
    // For this web context, window.location.origin is correct.
    return window.location.origin + window.location.pathname;
}
