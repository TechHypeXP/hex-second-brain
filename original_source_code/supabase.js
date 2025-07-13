import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://npwcmywhkspeigvsputv.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseKey)

