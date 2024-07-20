import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://curator-project.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcnVwZm9scmdpeHN6dmNyY3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0ODI2NjcsImV4cCI6MjAzNzA1ODY2N30.8UdLh-nibe48xZuFVFQYgFbhzDwGUNEuTY6e6sB_4VY')