import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhiucwzqxryxwocgvbfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaXVjd3pxeHJ5eHdvY2d2YmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzYzMzEsImV4cCI6MjA2NTc1MjMzMX0.GUns5jhgWXRiXus49TebanP3NqE7C0-02G5NrvcYPVM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);