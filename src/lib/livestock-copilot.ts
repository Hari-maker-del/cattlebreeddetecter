import { supabase } from "@/integrations/supabase/client";

export type CopilotRow = { label: string; value: string; detail?: string };
export type CopilotResult = { title: string; text: string; data?: CopilotRow[] };

type Animal = { id: string; animal_code: string; animal_type: string; breed: string | null; confidence: number | null };
type Milk = { animal_id: string; recorded_at: string; quantity_liters: number; session: string };
type Health = { animal_id: string; recorded_at: string; status: string; title: string; notes: string | null };
type Feed = { animal_id: string; recorded_at: string; feed_type: string; quantity_kg: number; notes: string | null };
type Breeding = { animal_id: string; event_date: string; event_type: string; status: string; notes: string | null };

type Intent = "count" | "milk" | "health" | "feed" | "breeding" | "animal" | "unknown";

const normalize = (input: string) => input
  .toLowerCase()
  .normalize("NFKC")
  .replace(/[?!.,;:]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

function detectIntent(input: string): Intent {
  const q = normalize(input);
  if (hasAny(q, ["how many", "evlo", "ethana", "எத்தனை", "எவ்வளவு மாடு", "மாடுகள் எத்தனை"])) return "count";
  if (hasAny(q, ["milk", "paal", "pal", "paalu", "பால்", "பால", "yield", "production"])) return "milk";
  if (hasAny(q, ["health", "sick", "attention", "problem", "issue", "noy", "noi", "udal", "aarokiyam", "கவனம்", "நோய்", "உடல்நிலை"])) return "health";
  if (hasAny(q, ["feed", "food", "fodder", "theeni", "theevanam", "theevanam", "தீனி", "தீவனம்", "சாப்பாடு"])) return "feed";
  if (hasAny(q, ["breed", "breeding", "pregnant", "pregnancy", "insemination", "mating", "karu", "கன்று", "இனப்பெருக்கம்", "சினை"])) return "breeding";
  if (hasAny(q, ["animal", "cow", "cattle", "buffalo", "maadu", "maadu", "மாடு", "மாடுகள்", "animal id", "tn-"])) return "animal";
  return "unknown";
}

function wantsLow(input: string) {
  return hasAny(normalize(input), ["less", "low", "lowest", "kammi", "kammia", "kurai", "குறை", "கம்மி", "குறைவாக", "குறைந்த"]);
}

function wantsRecent(input: string) {
  return hasAny(normalize(input), ["today", "recent", "recently", "this week", "today", "innaiku", "indru", "இன்று", "சமீபத்தில்", "இந்த வாரம்"]);
}

function fmt(n: number) { return Number(n || 0).toFixed(1).replace(/\.0$/, ""); }

async function loadContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to use your farm Copilot.");
  const { data: farms, error: farmError } = await supabase.from("farms").select("id").eq("user_id", user.id).limit(1);
  if (farmError) throw farmError;
  const farmId = farms?.[0]?.id;
  if (!farmId) return { animals: [] as Animal[], milk: [] as Milk[], health: [] as Health[], feed: [] as Feed[], breeding: [] as Breeding[] };

  const [{ data: animals, error: a }, { data: milk, error: m }, { data: health, error: h }, { data: feed, error: f }, { data: breeding, error: b }] = await Promise.all([
    supabase.from("animals").select("id,animal_code,animal_type,breed,confidence").eq("farm_id", farmId),
    supabase.from("milk_records").select("animal_id,recorded_at,quantity_liters,session").in("animal_id", [] as string[]),
    supabase.from("health_records").select("animal_id,recorded_at,status,title,notes").in("animal_id", [] as string[]),
    supabase.from("feed_records").select("animal_id,recorded_at,feed_type,quantity_kg,notes").in("animal_id", [] as string[]),
    supabase.from("breeding_records").select("animal_id,event_date,event_type,status,notes").in("animal_id", [] as string[]),
  ]);
  if (a) throw a;
  const ids = (animals ?? []).map((x) => x.id);
  if (ids.length) {
    const [milkRes, healthRes, feedRes, breedingRes] = await Promise.all([
      supabase.from("milk_records").select("animal_id,recorded_at,quantity_liters,session").in("animal_id", ids),
      supabase.from("health_records").select("animal_id,recorded_at,status,title,notes").in("animal_id", ids),
      supabase.from("feed_records").select("animal_id,recorded_at,feed_type,quantity_kg,notes").in("animal_id", ids),
      supabase.from("breeding_records").select("animal_id,event_date,event_type,status,notes").in("animal_id", ids),
    ]);
    if (milkRes.error) throw milkRes.error;
    if (healthRes.error) throw healthRes.error;
    if (feedRes.error) throw feedRes.error;
    if (breedingRes.error) throw breedingRes.error;
    return { animals: animals ?? [], milk: milkRes.data ?? [], health: healthRes.data ?? [], feed: feedRes.data ?? [], breeding: breedingRes.data ?? [] };
  }
  if (m || h || f || b) throw m || h || f || b;
  return { animals: animals ?? [], milk: [], health: [], feed: [], breeding: [] };
}

export async function askLivestockCopilot(question: string): Promise<CopilotResult> {
  const context = await loadContext();
  const intent = detectIntent(question);
  const recent = wantsRecent(question);
  const low = wantsLow(question);
  const animalMap = new Map(context.animals.map((a) => [a.id, a]));

  if (intent === "count") {
    const counts = context.animals.reduce<Record<string, number>>((acc, a) => { acc[a.animal_type] = (acc[a.animal_type] || 0) + 1; return acc; }, {});
    return { title: "Your animals", text: `You currently have ${context.animals.length} saved animals.`, data: Object.entries(counts).map(([label, value]) => ({ label, value: String(value) })) };
  }

  if (intent === "milk") {
    const records = recent ? context.milk.filter((r) => Date.now() - new Date(r.recorded_at).getTime() <= 7 * 86400000) : context.milk;
    const totals = new Map<string, number>();
    for (const r of records) totals.set(r.animal_id, (totals.get(r.animal_id) || 0) + Number(r.quantity_liters));
    const rows = [...totals.entries()].sort((a, b) => low ? a[1] - b[1] : b[1] - a[1]).slice(0, 8).map(([id, value]) => ({ label: animalMap.get(id)?.animal_code || "Animal", value: `${fmt(value)} L`, detail: animalMap.get(id)?.breed || animalMap.get(id)?.animal_type }));
    return { title: low ? "Lower milk records" : "Milk production", text: records.length ? `I found ${records.length} milk records${recent ? " from the last 7 days" : ""}.` : "I don't have milk records for that period yet.", data: rows };
  }

  if (intent === "health") {
    const rows = context.health.filter((r) => !recent || Date.now() - new Date(r.recorded_at).getTime() <= 7 * 86400000).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()).slice(0, 8).map((r) => ({ label: animalMap.get(r.animal_id)?.animal_code || "Animal", value: r.status, detail: `${r.title}${r.notes ? ` · ${r.notes}` : ""}` }));
    return { title: "Health observations", text: rows.length ? `I found ${rows.length} recent health observations.` : "I don't have health observations yet.", data: rows };
  }

  if (intent === "feed") {
    const rows = context.feed.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()).slice(0, 8).map((r) => ({ label: animalMap.get(r.animal_id)?.animal_code || "Animal", value: `${fmt(Number(r.quantity_kg))} kg`, detail: `${r.feed_type}${r.notes ? ` · ${r.notes}` : ""}` }));
    return { title: "Recent feed records", text: rows.length ? `I found ${rows.length} recent feed records.` : "I don't have feed records yet.", data: rows };
  }

  if (intent === "breeding") {
    const rows = context.breeding.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()).slice(0, 8).map((r) => ({ label: animalMap.get(r.animal_id)?.animal_code || "Animal", value: r.status, detail: `${r.event_type}${r.notes ? ` · ${r.notes}` : ""}` }));
    return { title: "Breeding records", text: rows.length ? `I found ${rows.length} breeding records.` : "I don't have breeding records yet.", data: rows };
  }

  if (intent === "animal") {
    const rows = context.animals.slice(0, 10).map((a) => ({ label: a.animal_code, value: a.breed || a.animal_type, detail: a.confidence ? `${fmt(Number(a.confidence))}% AI confidence` : undefined }));
    return { title: "Your saved animals", text: context.animals.length ? `You have ${context.animals.length} saved animals.` : "No animals are saved yet. Analyze an animal to add your first one.", data: rows };
  }

  return { title: "I can help with your farm", text: "Ask me about animals, milk production, health observations, feed records, or breeding history. You can speak in English, Tamil, or Tanglish." };
}
