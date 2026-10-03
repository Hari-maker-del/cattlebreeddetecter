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

  const q = question.toLowerCase();
  const wantsMilk = /milk|milking|pāl|பால்|litre|liter|litres|liters/.test(q);
  const wantsHealth = /health|sick|attention|concern|healthy|doctor|vet|problem|issue|நலம்|உடல்நலம்/.test(q);
  const wantsFeed = /feed|fodder|food|கலவை|தீனி|தீவனம்/.test(q);
  const wantsBreeding = /breed|breeding|pregnan|mating|insemin|கருவுற|இனப்பெருக்க/.test(q);
  const wantsAnimals = /animal|animals|cow|cattle|buffalo|goat|sheep|மாடு|மாடுகள்|கால்நடை/.test(q);

  if (wantsMilk) {
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
    if (!target || target.litres === 0) return { title: "Milk records", text: "I don't have milk records for these animals yet. Record today's milk on an animal profile and I can compare production." };
    return {
      title: "Milk production",
      text: `${target.animal.animal_code} has the lowest recorded milk total in the available records: ${target.litres.toFixed(1)} L. This is a record-based observation, not a diagnosis.`,
      data: ranked.slice(0, 5).map((x) => ({ label: x.animal.animal_code, value: `${x.litres.toFixed(1)} L`, detail: x.animal.breed ?? x.animal.animal_type })),
    };
  }

  if (wantsHealth) {
    const { data, error } = await supabase
      .from("health_records")
      .select("animal_id,recorded_at,status,title,notes")
      .in("animal_id", animals.map((a) => a.id))
      .order("recorded_at", { ascending: false });
    if (error) throw error;
    const attention = (data ?? []).filter((r) => ["needs attention", "attention", "follow-up", "observation"].includes(String(r.status).toLowerCase()));
    const latest = new Map<string, (typeof attention)[number]>();
    for (const row of attention) if (!latest.has(row.animal_id)) latest.set(row.animal_id, row);
    if (!latest.size) return { title: "Health overview", text: "I don't see health records marked for attention in the available data." };
    const rows = [...latest.entries()].map(([animalId, record]) => {
      const animal = animals.find((a) => a.id === animalId);
      return { label: animal?.animal_code ?? "Animal", value: record.status, detail: record.title };
    });
    return { title: "Animals needing attention", text: `${rows.length} animal${rows.length === 1 ? " may" : "s may"} have a recorded health observation or follow-up. Consider reviewing the record and contacting a veterinarian when appropriate.`, data: rows };
  }

  if (wantsFeed) {
    const { data, error } = await supabase.from("feed_records").select("animal_id,recorded_at,feed_type,quantity_kg,notes").in("animal_id", animals.map((a) => a.id)).order("recorded_at", { ascending: false }).limit(8);
    if (error) throw error;
    if (!data?.length) return { title: "Feed records", text: "No feed records are available yet. Add a feed entry from the Feed section and I can summarize it here." };
    return { title: "Recent feed records", text: `I found ${data.length} recent feed records across your animals.`, data: data.slice(0, 6).map((r) => ({ label: animals.find((a) => a.id === r.animal_id)?.animal_code ?? "Animal", value: `${r.quantity_kg} kg ${r.feed_type}`, detail: new Date(r.recorded_at).toLocaleDateString() })) };
  }

  if (wantsBreeding) {
    const { data, error } = await supabase.from("breeding_records").select("animal_id,event_date,event_type,status,notes").in("animal_id", animals.map((a) => a.id)).order("event_date", { ascending: false }).limit(8);
    if (error) throw error;
    if (!data?.length) return { title: "Breeding records", text: "No breeding records are available yet. Add a breeding event to an animal and I can summarize its history." };
    return { title: "Recent breeding records", text: `I found ${data.length} recent breeding records.`, data: data.slice(0, 6).map((r) => ({ label: animals.find((a) => a.id === r.animal_id)?.animal_code ?? "Animal", value: `${r.event_type} · ${r.status}`, detail: new Date(r.event_date).toLocaleDateString() })) };
  }

  if (wantsAnimals || q.includes("show") || q.includes("list") || q.includes("எந்த")) {
    return { title: "Your animals", text: animals.length ? `You currently have ${animals.length} saved animal${animals.length === 1 ? "" : "s"} in this farm.`, data: animals.slice(0, 10).map((a) => ({ label: a.animal_code, value: a.breed ?? a.animal_type, detail: a.confidence ? `${Number(a.confidence).toFixed(1)}% confidence` : undefined })) };
  }

  return {
    title: "I can work with your farm data",
    text: "Ask me about milk, health, feed, breeding, or your saved animals. I will use the records stored for your farm rather than inventing an answer.",
  };
}
