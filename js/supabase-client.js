const SUPABASE_URL = 'https://xucemercextdhzfwsswp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y2VtZXJjZXh0ZGh6Zndzc3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MzM0ODEsImV4cCI6MjEwODQwOTQ4MX0.O7HQEEyWGUNuzXAIisr1HzkjvzpCCbJqApCGz7BSa1U';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
