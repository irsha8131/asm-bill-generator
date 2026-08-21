import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://powrhkoxalmfuqygyntv.supabase.co";

const supabaseAnonKey =
  "sb_publishable_sxTQ9Jznlg917rJZghI1hA_Fm_ZY64z";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);