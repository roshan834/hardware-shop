import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rljfkhiibabxrdnykdxu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsamZraGlpYmFieHJkbnlrZHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDU0NjAsImV4cCI6MjA5NjYyMTQ2MH0.Yjun9HdW9JCmcNAJvR-e74uS1DogDFUYLIC3yzeXGnI'

export const supabase =
  createClient(supabaseUrl, supabaseKey)