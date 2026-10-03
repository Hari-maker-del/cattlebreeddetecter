import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kihtrqkfxcfzvhwbptwe.supabase.co";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_2XWus-J6lL7h13WplwL3LQ_izLTbvo1";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
