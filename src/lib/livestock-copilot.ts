import { supabase } from "@/lib/supabase";

export type CopilotResult = {
  title: string;
  text: string;
  data?: Array<{ label: string; value: string; detail?: string }>;
};

async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) throw new Error("Unable to start your farm session.");
  return session.data.session.user.id;
}

async function getFarmId(userId: string) {
  const { data, error } = await supabase.from("farms").select("id,name").eq("owner_id", userId).limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

/**
 * Lightweight multilingual intent layer for English, Tamil and common Tanglish.
 * It normalizes common farmer phrases before routing to the real Supabase data.
 * This is deliberately deterministic: it never invents farm facts.
 */
function normalizeIntent(input: string) {
  const q = input.toLowerCase().trim();
  const compact = q.replace(/[?!.,;:]/g, " ").replace(/\s+/g, " ");

  const milk = [
    "milk", "milking", "pāl", "paal", "பால்", "paaloda", "paaloda", "paal kudukk", "paal kodukk",
    "paal kammi", "paal korai", "paal kurai", "paal adhigam", "paal athigam", "litre", "liter", "litres", "liters",
  ];
  const health = [
    "health", "sick", "attention", "concern", "healthy", "doctor", "vet", "problem", "issue", "நலம்", "உடல்நலம்",
    "udal nalam", "udambu", "udambu sari illa", "sari illa", "sugam illa", "maruthuvam", "doctor venum", "vet venum",
    "கவனம்", "நோய்", "உடம்பு", "பிரச்சனை",
  ];
  const feed = [
    "feed", "fodder", "food", "கலவை", "தீனி", "தீவனம்", "kalavai", "theeni", "theevanam", "saapadu", "sapadu",
    "enna theeni", "theeni enna", "feed record", "feed records",
  ];
  const breeding = [
    "breeding", "breed", "pregnan", "mating", "insemin", "கருவுற", "இனப்பெருக்க", "karuvura", "karuvuruthal",
    "mating record", "breeding record", "breeding records", "pregnancy", "pregnant",
  ];
  const animals = [
    "animal", "animals", "cow", "cattle", "buffalo", "goat", "sheep", "மாடு", "மாடுகள்", "கால்நடை", "kaalnadai",
    "maadu", "maadugal", "pasu", "erumai", "aadu", "aadu", "my animals", "my animal", "en maadu", "en maadugal",
  ];

  const has = (terms: string[]) => terms.some((term) => compact.includes(term));
  const wantsMilk = has(milk);
  const wantsHealth = has(health);
  const wantsFeed = has(feed);
  const wantsBreeding = has(breeding);
  const wantsAnimals = has(animals);

  // More specific intent wins when a phrase contains multiple concepts.
  if (wantsMilk) return "milk" as const;
  if (wantsHealth) return "health" as const;
  if (wantsFeed) return "feed" as const;
  if (wantsBreeding) return "breeding" as const;
  if (wantsAnimals || /show|list|எந்த|எத்தனை|என்னிடம்|என்கிட்ட|irukku|irukka|ullathu|ulladhu|irukanga|irukkanga/.test(compact)) return "animals" as const;
  return "general" as const;
}

function formatLanguageAware(kind: string, languageHint: string | undefined, count: number) {
  const isTamil = languageHint && /[\u0B80-\u0BFF]/.test(languageHint);
  const isTanglish = languageHint && /\b(unga|ungal|en|enna|evlo|irukku|irukka|maadu|maadugal|paal|theeni|udambu|sari|venum|kaamikka|sollu|sollunga)\b/i.test(languageHint);
  if (isTamil) {
    if (kind === "animals") return `உங்கள் பண்ணையில் ${count} கால்நடைகள் சேமிக்கப்பட்டுள்ளன.`;
    if (kind === "milk") return "உங்கள் பால் பதிவுகளை வைத்து இந்த தகவலைக் கண்டுபிடித்தேன்.";
    if (kind === "health") return "சேமிக்கப்பட்ட உடல்நல பதிவுகளில் கவனம் தேவைப்படும் பதிவுகளைப் பார்த்தேன்.";
  }
  if (isTanglish) {
    if (kind === "animals") return `Unga farm-la ${count} animals save pannirukku.`;
    if (kind === "milk") return "Unga milk records-a base panni indha information-a kandupidichen.";
    if (kind === "health") return "Save pannirukkura health records-la attention thevai padra records-a paathen.";
  }
  return "";
}

export async function askLivestockCopilot(question: string): Promise<CopilotResult> {
  const userId = await ensureSession();
  const farmId = await getFarmId(userId);
  if (!farmId) return { title: "Your farm is ready for data", text: "Save your first animal, then I can answer questions from its real farm records." };

  const { data: animals, error: animalError } = await supabase
    .from("animals")
    .select("id,animal_code,animal_type,breed,confidence")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false });
  if (animalError) throw animalError;

  const intent = normalizeIntent(question);
  const tamilIntro = formatLanguageAware(intent, question, animals.length);

  if (intent === "milk") {
    const { data, error } = await supabase
      .from("milk_records")
      .select("animal_id,recorded_at,session,quantity_liters")
      .in("animal_id", animals.map((a) => a.id))
      .order("recorded_at", { ascending: false });
    if (error) throw error;
    const byAnimal = new Map<string, number>();
    for (const row of data ?? []) byAnimal.set(row.animal_id, (byAnimal.get(row.animal_id) ?? 0) + Number(row.quantity_liters));
    const ranked = animals.map((a) => ({ animal: a, litres: byAnimal.get(a.id) ?? 0 })).sort((a, b) => a.litres - b.litres);
    const target = ranked[0];
    if (!target || target.litres === 0) return { title: "Milk records", text: tamilIntro || "I don't have milk records for these animals yet. Record today's milk on an animal profile and I can compare production." };
    return {
      title: tamilIntro ? "பால் உற்பத்தி" : "Milk production",
      text: tamilIntro ? `${target.animal.animal_code} குறைந்த அளவு பால் பதிவு கொண்டுள்ளது: ${target.litres.toFixed(1)} L. இது பதிவுகளின் அடிப்படையிலான தகவல்.` : `${target.animal.animal_code} has the lowest recorded milk total in the available records: ${target.litres.toFixed(1)} L. This is a record-based observation, not a diagnosis.`,
      data: ranked.slice(0, 5).map((x) => ({ label: x.animal.animal_code, value: `${x.litres.toFixed(1)} L`, detail: x.animal.breed ?? x.animal.animal_type })),
    };
  }

  if (intent === "health") {
    const { data, error } = await supabase
      .from("health_records")
      .select("animal_id,recorded_at,status,title,notes")
      .in("animal_id", animals.map((a) => a.id))
      .order("recorded_at", { ascending: false });
    if (error) throw error;
    const attention = (data ?? []).filter((r) => ["needs attention", "attention", "follow-up", "observation"].includes(String(r.status).toLowerCase()));
    const latest = new Map<string, (typeof attention)[number]>();
    for (const row of attention) if (!latest.has(row.animal_id)) latest.set(row.animal_id, row);
    if (!latest.size) return { title: "Health overview", text: tamilIntro || "I don't see health records marked for attention in the available data." };
    const rows = [...latest.entries()].map(([animalId, record]) => {
      const animal = animals.find((a) => a.id === animalId);
      return { label: animal?.animal_code ?? "Animal", value: record.status, detail: record.title };
    });
    return { title: tamilIntro ? "கவனம் தேவைப்படும் கால்நடைகள்" : "Animals needing attention", text: tamilIntro ? `${rows.length} கால்நடைகளுக்கு பதிவுகளில் கவனம் அல்லது follow-up உள்ளது. பதிவை சரிபார்த்து, தேவையானால் கால்நடை மருத்துவரை அணுகவும்.` : `${rows.length} animal${rows.length === 1 ? " may" : "s may"} have a recorded health observation or follow-up. Consider reviewing the record and contacting a veterinarian when appropriate.`, data: rows };
  }

  if (intent === "feed") {
    const { data, error } = await supabase.from("feed_records").select("animal_id,recorded_at,feed_type,quantity_kg,notes").in("animal_id", animals.map((a) => a.id)).order("recorded_at", { ascending: false }).limit(8);
    if (error) throw error;
    if (!data?.length) return { title: "Feed records", text: tamilIntro || "No feed records are available yet. Add a feed entry from the Feed section and I can summarize it here." };
    return { title: tamilIntro ? "சமீபத்திய தீவன பதிவுகள்" : "Recent feed records", text: tamilIntro ? `${data.length} சமீபத்திய தீவன பதிவுகள் கிடைத்தன.` : `I found ${data.length} recent feed records across your animals.`, data: data.slice(0, 6).map((r) => ({ label: animals.find((a) => a.id === r.animal_id)?.animal_code ?? "Animal", value: `${r.quantity_kg} kg ${r.feed_type}`, detail: new Date(r.recorded_at).toLocaleDateString() })) };
  }

  if (intent === "breeding") {
    const { data, error } = await supabase.from("breeding_records").select("animal_id,event_date,event_type,status,notes").in("animal_id", animals.map((a) => a.id)).order("event_date", { ascending: false }).limit(8);
    if (error) throw error;
    if (!data?.length) return { title: "Breeding records", text: tamilIntro || "No breeding records are available yet. Add a breeding event to an animal and I can summarize its history." };
    return { title: tamilIntro ? "சமீபத்திய இனப்பெருக்க பதிவுகள்" : "Recent breeding records", text: tamilIntro ? `${data.length} சமீபத்திய இனப்பெருக்க பதிவுகள் கிடைத்தன.` : `I found ${data.length} recent breeding records.`, data: data.slice(0, 6).map((r) => ({ label: animals.find((a) => a.id === r.animal_id)?.animal_code ?? "Animal", value: `${r.event_type} · ${r.status}`, detail: new Date(r.event_date).toLocaleDateString() })) };
  }

  if (intent === "animals") {
    return { title: tamilIntro ? "உங்கள் கால்நடைகள்" : "Your animals", text: tamilIntro || `You currently have ${animals.length} saved animal${animals.length === 1 ? "" : "s"} in this farm.`, data: animals.slice(0, 10).map((a) => ({ label: a.animal_code, value: a.breed ?? a.animal_type, detail: a.confidence ? `${Number(a.confidence).toFixed(1)}% confidence` : undefined })) };
  }

  return {
    title: "Livestock Copilot",
    text: "Ask me in English, தமிழ், or Tanglish about milk, health, feed, breeding, or your animals. I will use your saved farm records rather than inventing an answer.",
  };
}
