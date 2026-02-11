import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, publicAnonKey } from "../../app/config";

export const supabase = createClient(supabaseUrl, publicAnonKey);
