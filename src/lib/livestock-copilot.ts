import { supabase } from "@/integrations/supabase/client";

export type CopilotRow = { label: string; value: string; detail?: string };
export type CopilotResult = { title: string; text: string; data?: CopilotRow[] };
export type CopilotLanguage = "en-IN" | "hi-IN" | "ta-IN" | "ta-Tanglish" | "te-IN" | "kn-IN" | "ml-IN" | "mr-IN" | "bn-IN" | "gu-IN" | "pa-IN" | "or-IN" | "as-IN" | "ur-IN";

type Animal = { id: string; animal_code: string; animal_type: string; breed: string | null; confidence: number | null };
type Milk = { animal_id: string; recorded_at: string; quantity_liters: number; session: string };
type Health = { animal_id: string; recorded_at: string; status: string; title: string; notes: string | null };
type Feed = { animal_id: string; recorded_at: string; feed_type: string; quantity_kg: number; notes: string | null };
type Breeding = { animal_id: string; event_date: string; event_type: string; status: string; notes: string | null };
type Intent = "count" | "milk" | "health" | "feed" | "breeding" | "animal" | "unknown";

const normalize = (input: string) => input.toLowerCase().normalize("NFKC").replace(/[?!.,;:]+/g, " ").replace(/\s+/g, " ").trim();
const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

function detectIntent(input: string): Intent {
  const q = normalize(input);
  if (hasAny(q, ["how many", "evlo", "ethana", "எத்தனை", "எவ்வளவு", "म कितने", "कितने", "कितनी", "कितने पशु", "कितने जानवर", "ఎన్ని", "ఎంత మంది", "ಎಷ್ಟು", "ಎಷ್ಟು ಹಸು", "എത്ര", "എത്ര പശു", "किती", "किती जनावर", "কত", "কয়টি", "কতগুলি", "કેટલા", "કેટલી", "ਕਿੰਨੇ", "କେତେ", "কিমান", "کتنے", "کتنی"])) return "count";
  if (hasAny(q, ["milk", "paal", "pal", "paalu", "பால்", "पानी दूध", "दूध", "दुग्ध", "दूध उत्पादन", "పాలు", "పాల ఉత్పత్తి", "ಹಾಲು", "ಹಾಲಿನ", "പാൽ", "പാലിന്റെ", "दूध", "दूध उत्पादन", "দুধ", "দুগ্ধ", "દૂધ", "ਦੁੱਧ", "ଦୁଧ", "গাখীৰ", "দুধ", "دودھ"])) return "milk";
  if (hasAny(q, ["health", "sick", "attention", "problem", "issue", "noy", "noi", "udal", "aarokiyam", "கவனம்", "நோய்", "உடல்நிலை", "स्वास्थ्य", "बीमार", "बीमारी", "समस्या", "ध्यान", "ఆరోగ్యం", "అనారోగ్యం", "సమస్య", "ಆರೋಗ್ಯ", "ಅನಾರೋಗ್ಯ", "ಸಮಸ್ಯೆ", "ആരോഗ്യം", "അസുഖം", "പ്രശ്നം", "आरोग्य", "आजारी", "आरोग्य समस्या", "স্বাস্থ্য", "অসুস্থ", "সমস্যা", "આરોગ્ય", "બીમાર", "સમસ્યા", "ਸਿਹਤ", "ਬਿਮਾਰ", "ਸਮੱਸਿਆ", "ସ୍ୱାସ୍ଥ୍ୟ", "ଅସୁସ୍ଥ", "ସମସ୍ୟା", "স্বাস্থ্য", "অসুস্থ", "স্বাস্থ্য সমস্যা", "صحت", "بیمار", "مسئلہ"])) return "health";
  if (hasAny(q, ["feed", "food", "fodder", "theeni", "theevanam", "தீனி", "தீவனம்", "சாப்பாடு", "चारा", "खाना", "पशु आहार", "ఆహారం", "మేత", "పశువుల ఆహారం", "ಆಹಾರ", "ಮೇವು", "കാലിത്തീറ്റ", "തീറ്റ", "चारा", "पशुखाद्य", "খাদ্য", "খাবার", "গবাদি পশুর খাবার", "ચારો", "પશુ આહાર", "ਚਾਰਾ", "ਪਸ਼ੂ ਖੁਰਾਕ", "ଖାଦ୍ୟ", "ଚାରା", "গৰুৰ খাদ্য", "چارپایوں کی خوراک", "چارہ"])) return "feed";
  if (hasAny(q, ["breed", "breeding", "pregnant", "pregnancy", "insemination", "mating", "karu", "கன்று", "இனப்பெருக்கம்", "சினை", "नस्ल", "प्रजनन", "गर्भवती", "गाभण", "जात", "జాతి", "సంతానోత్పత్తి", "గర్భం", "ತಳಿ", "ಸಂತಾನೋತ್ಪತ್ತಿ", "ಗರ್ಭಿಣಿ", "ഇനം", "പ്രജനനം", "ഗർഭിണി", "जाती", "प्रजनन", "गाभण", "জাত", "প্রজনন", "গর্ভবতী", "જાતિ", "પ્રજનન", "ગર્ભવતી", "ਨਸਲ", "ਪ੍ਰਜਨਨ", "ਗਰਭਵਤੀ", "ଜାତି", "ପ୍ରଜନନ", "ଗର୍ଭବତୀ", "জাতি", "প্ৰজনন", "গৰ্ভৱতী", "نسل", "افزائش", "حاملہ"])) return "breeding";
  if (hasAny(q, ["animal", "cow", "cattle", "buffalo", "maadu", "மாடு", "மாடுகள்", "animal id", "tn-", "पशु", "गाय", "गायें", "भैंस", "గొర్రె", "ఆవు", "గేదె", "పశువు", "ಹಸು", "ಎಮ್ಮೆ", "ಜಾನುವಾರು", "പശു", "പോത്ത്", "കന്നുകാലി", "गाय", "म्हैस", "जनावर", "গরু", "মহিষ", "পশু", "ગાય", "ભેંસ", "પશુ", "ਗਾਂ", "ਮੱਝ", "ਪਸ਼ੂ", "ଗାଈ", "ମଇଁଷି", "ପଶୁ", "গৰু", "ম’হ", "পশু", "گائے", "بھینس", "مویشی"])) return "animal";
  return "unknown";
}

function wantsLow(input: string) { return hasAny(normalize(input), ["less", "low", "lowest", "kammi", "kammia", "kurai", "குறை", "கம்மி", "குறைவாக", "குறைந்த", "कम", "कम दूध", "कम है", "తక్కువ", "తక్కువ పాలు", "ಕಡಿಮೆ", "ಕಡಿಮೆ ಹಾಲು", "കുറവ്", "കുറഞ്ഞ", "कमी", "कमीचे", "কম", "কম দুধ", "ઓછું", "ઓછું દૂધ", "ਘੱਟ", "ଅଧିକ କମ", "কম", "کم"]); }
function wantsRecent(input: string) { return hasAny(normalize(input), ["today", "recent", "recently", "this week", "innaiku", "indru", "இன்று", "சமீபத்தில்", "இந்த வாரம்", "आज", "हाल में", "इस हफ्ते", "ఈ రోజు", "ఇటీవల", "ఈ వారం", "ಇಂದು", "ಇತ್ತೀಚೆಗೆ", "ಈ ವಾರ", "ഇന്ന്", "അടുത്തിടെ", "ഈ ആഴ്ച", "आज", "अलीकडे", "या आठवड्यात", "আজ", "সম্প্রতি", "এই সপ্তাহে", "આજે", "તાજેતરમાં", "આ અઠવાડિયે", "ਅੱਜ", "ਹਾਲ ਹੀ ਵਿੱਚ", "ਇਸ ਹਫ਼ਤੇ", "ଆଜି", "ସମ୍ପ୍ରତି", "ଏହି ସପ୍ତାହରେ", "আজ", "শেহতীয়া", "এই সপ্তাহত", "آج", "حال ہی میں", "اس ہفتے"]); }
function fmt(n: number) { return Number(n || 0).toFixed(1).replace(/\.0$/, ""); }

async function loadContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to use your farm Copilot.");
  const { data: farms, error: farmError } = await supabase.from("farms").select("id").eq("user_id", user.id).limit(1);
  if (farmError) throw farmError;
  const farmId = farms?.[0]?.id;
  if (!farmId) return { animals: [] as Animal[], milk: [] as Milk[], health: [] as Health[], feed: [] as Feed[], breeding: [] as Breeding[] };
  const { data: animals, error: a } = await supabase.from("animals").select("id,animal_code,animal_type,breed,confidence").eq("farm_id", farmId);
  if (a) throw a;
  const ids = (animals ?? []).map((x) => x.id);
  if (!ids.length) return { animals: animals ?? [], milk: [], health: [], feed: [], breeding: [] };
  const [milkRes, healthRes, feedRes, breedingRes] = await Promise.all([
    supabase.from("milk_records").select("animal_id,recorded_at,quantity_liters,session").in("animal_id", ids),
    supabase.from("health_records").select("animal_id,recorded_at,status,title,notes").in("animal_id", ids),
    supabase.from("feed_records").select("animal_id,recorded_at,feed_type,quantity_kg,notes").in("animal_id", ids),
    supabase.from("breeding_records").select("animal_id,event_date,event_type,status,notes").in("animal_id", ids),
  ]);
  if (milkRes.error) throw milkRes.error; if (healthRes.error) throw healthRes.error; if (feedRes.error) throw feedRes.error; if (breedingRes.error) throw breedingRes.error;
  return { animals: animals ?? [], milk: milkRes.data ?? [], health: healthRes.data ?? [], feed: feedRes.data ?? [], breeding: breedingRes.data ?? [] };
}

export async function askLivestockCopilot(question: string, language: CopilotLanguage = "en-IN"): Promise<CopilotResult> {
  const context = await loadContext();
  const intent = detectIntent(question); const recent = wantsRecent(question); const low = wantsLow(question);
  const animalMap = new Map(context.animals.map((a) => [a.id, a]));
  const countText: Record<CopilotLanguage, string> = {
    "en-IN": `You currently have ${context.animals.length} saved animals.`, "hi-IN": `आपके पास अभी ${context.animals.length} पशु सुरक्षित हैं।`, "ta-IN": `உங்கள் பண்ணையில் ${context.animals.length} விலங்குகள் சேமிக்கப்பட்டுள்ளன.`, "ta-Tanglish": `Unga farm-la ${context.animals.length} animals save pannirukku.`, "te-IN": `మీ వద్ద ప్రస్తుతం ${context.animals.length} పశువులు సేవ్ చేయబడ్డాయి.`, "kn-IN": `ನಿಮ್ಮ ಬಳಿ ಈಗ ${context.animals.length} ಜಾನುವಾರುಗಳಿವೆ.`, "ml-IN": `നിങ്ങളുടെ ഫാമിൽ ${context.animals.length} മൃഗങ്ങൾ സേവ് ചെയ്തിട്ടുണ്ട്.`, "mr-IN": `तुमच्याकडे सध्या ${context.animals.length} जनावरे जतन केलेली आहेत.`, "bn-IN": `আপনার কাছে বর্তমানে ${context.animals.length}টি পশু সংরক্ষিত আছে।`, "gu-IN": `તમારી પાસે હાલમાં ${context.animals.length} પશુઓ સેવ થયેલા છે.`, "pa-IN": `ਤੁਹਾਡੇ ਕੋਲ ਇਸ ਵੇਲੇ ${context.animals.length} ਪਸ਼ੂ ਸੇਵ ਕੀਤੇ ਹੋਏ ਹਨ।`, "or-IN": `ଆପଣଙ୍କ ପାଖରେ ବର୍ତ୍ତମାନ ${context.animals.length}ଟି ପଶୁ ସଂରକ୍ଷିତ ଅଛି।`, "as-IN": `আপোনাৰ ফাৰ্মত বৰ্তমান ${context.animals.length}টা পশু সংৰক্ষিত আছে।`, "ur-IN": `آپ کے پاس اس وقت ${context.animals.length} جانور محفوظ ہیں۔`,
  };
  const generic: Record<CopilotLanguage, string> = { "en-IN": "Ask me about animals, milk production, health, feed records, or breeding history.", "hi-IN": "आप पशुओं, दूध उत्पादन, स्वास्थ्य, चारे या प्रजनन इतिहास के बारे में पूछ सकते हैं।", "ta-IN": "விலங்குகள், பால் உற்பத்தி, உடல்நலம், தீவனம் அல்லது இனப்பெருக்கம் பற்றி கேளுங்கள்.", "ta-Tanglish": "Animals, paal production, health, theevanam illa breeding history pathi kelunga.", "te-IN": "పశువులు, పాల ఉత్పత్తి, ఆరోగ్యం, మేత లేదా సంతానోత్పత్తి గురించి అడగండి.", "kn-IN": "ಜಾನುವಾರು, ಹಾಲು, ಆರೋಗ್ಯ, ಮೇವು ಅಥವಾ ಸಂತಾನೋತ್ಪತ್ತಿ ಬಗ್ಗೆ ಕೇಳಿ.", "ml-IN": "മൃഗങ്ങൾ, പാൽ ഉൽപ്പാദനം, ആരോഗ്യം, തീറ്റ അല്ലെങ്കിൽ പ്രജനനം എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ.", "mr-IN": "जनावरे, दूध उत्पादन, आरोग्य, चारा किंवा प्रजनन इतिहासाबद्दल विचारा.", "bn-IN": "পশু, দুধ উৎপাদন, স্বাস্থ্য, খাদ্য বা প্রজননের ইতিহাস সম্পর্কে জিজ্ঞাসা করুন।", "gu-IN": "પશુઓ, દૂધ ઉત્પાદન, આરોગ્ય, ચારો અથવા પ્રજનન વિશે પૂછો.", "pa-IN": "ਪਸ਼ੂਆਂ, ਦੁੱਧ ਉਤਪਾਦਨ, ਸਿਹਤ, ਚਾਰੇ ਜਾਂ ਪ੍ਰਜਨਨ ਬਾਰੇ ਪੁੱਛੋ।", "or-IN": "ପଶୁ, କ୍ଷୀର ଉତ୍ପାଦନ, ସ୍ୱାସ୍ଥ୍ୟ, ଖାଦ୍ୟ କିମ୍ବା ପ୍ରଜନନ ବିଷୟରେ ପଚାରନ୍ତୁ।", "as-IN": "পশু, গাখীৰ উৎপাদন, স্বাস্থ্য, খাদ্য বা প্ৰজননৰ বিষয়ে সোধক।", "ur-IN": "جانوروں، دودھ کی پیداوار، صحت، چارے یا افزائش کے بارے میں پوچھیں۔" };

  if (intent === "count") {
    const counts = context.animals.reduce<Record<string, number>>((acc, a) => { acc[a.animal_type] = (acc[a.animal_type] || 0) + 1; return acc; }, {});
    return { title: language === "ta-IN" ? "உங்கள் விலங்குகள்" : language === "hi-IN" ? "आपके पशु" : language === "te-IN" ? "మీ పశువులు" : language === "kn-IN" ? "ನಿಮ್ಮ ಜಾನುವಾರುಗಳು" : language === "ml-IN" ? "നിങ്ങളുടെ മൃഗങ്ങൾ" : "Your animals", text: countText[language], data: Object.entries(counts).map(([label, value]) => ({ label, value: String(value) })) };
  }
  if (intent === "milk") {
    const records = recent ? context.milk.filter((r) => Date.now() - new Date(r.recorded_at).getTime() <= 7 * 86400000) : context.milk;
    const totals = new Map<string, number>(); for (const r of records) totals.set(r.animal_id, (totals.get(r.animal_id) || 0) + Number(r.quantity_liters));
    const rows = [...totals.entries()].sort((a, b) => low ? a[1] - b[1] : b[1] - a[1]).slice(0, 8).map(([id, value]) => ({ label: animalMap.get(id)?.animal_code || "Animal", value: `${fmt(value)} L`, detail: animalMap.get(id)?.breed || animalMap.get(id)?.animal_type }));
    return { title: low ? "Lower milk records" : "Milk production", text: records.length ? `${records.length} milk records${recent ? " from the last 7 days" : ""}.` : "No milk records for that period yet.", data: rows };
  }
  if (intent === "health") {
    const rows = context.health.filter((r) => !recent || Date.now() - new Date(r.recorded_at).getTime() <= 7 * 86400000).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()).slice(0, 8).map((r) => ({ label: animalMap.get(r.animal_id)?.animal_code || "Animal", value: r.status, detail: `${r.title}${r.notes ? ` · ${r.notes}` : ""}` }));
    return { title: "Health observations", text: rows.length ? `${rows.length} recent health observations found.` : "No health observations yet.", data: rows };
  }
  if (intent === "feed") {
    const rows = context.feed.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()).slice(0, 8).map((r) => ({ label: animalMap.get(r.animal_id)?.animal_code || "Animal", value: `${fmt(Number(r.quantity_kg))} kg`, detail: `${r.feed_type}${r.notes ? ` · ${r.notes}` : ""}` }));
    return { title: "Recent feed records", text: rows.length ? `${rows.length} recent feed records found.` : "No feed records yet.", data: rows };
  }
  if (intent === "breeding") {
    const rows = context.breeding.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()).slice(0, 8).map((r) => ({ label: animalMap.get(r.animal_id)?.animal_code || "Animal", value: r.status, detail: `${r.event_type}${r.notes ? ` · ${r.notes}` : ""}` }));
    return { title: "Breeding records", text: rows.length ? `${rows.length} breeding records found.` : "No breeding records yet.", data: rows };
  }
  if (intent === "animal") {
    const rows = context.animals.slice(0, 10).map((a) => ({ label: a.animal_code, value: a.breed || a.animal_type, detail: a.confidence ? `${fmt(Number(a.confidence))}% AI confidence` : undefined }));
    return { title: "Your saved animals", text: context.animals.length ? countText[language] : "No animals are saved yet. Analyze an animal to add your first one.", data: rows };
  }
  return { title: "Livestock Copilot", text: generic[language] };
}
