import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, publicSupabaseKey } from "../../app/config";

export const supabase = createClient(supabaseUrl, publicSupabaseKey);
