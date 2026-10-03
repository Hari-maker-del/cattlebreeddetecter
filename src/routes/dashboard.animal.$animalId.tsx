import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Check, HeartPulse, Milk, Pencil, RefreshCw, Sparkles, Wheat, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/animal/$animalId")({
  head: () => ({ meta: [{ title: "Animal Profile — Livestock Copilot" }] }),
  component: AnimalProfilePage,
});

type Animal = {
  id: string;
  farm_id: string;
  animal_code: string;
  animal_type: string;
  breed: string | null;
  confidence: number | null;
  image_path: string | null;
  image_url: string | null;
  analysis_explanation: string | null;
  features: string[] | null;
  created_at: string;
  updated_at: string;
};

async function getImageUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from("animal-images").createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

function AnimalProfilePage() {
  const { animalId } = Route.useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnimal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("animals")
        .select("id,farm_id,animal_code,animal_type,breed,confidence,image_path,image_url,analysis_explanation,features,created_at,updated_at")
        .eq("animal_code", animalId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Animal not found");
        navigate({ to: "/dashboard/" });
        return;
      }

      setAnimal(data as Animal);
      setImageUrl(await getImageUrl(data.image_path));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't load this animal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAnimal(); }, [animalId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ec] p-6 text-[#17231e]">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6 pt-12">
          <div className="h-5 w-40 rounded bg-[#dfe3dc]" />
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div className="h-[520px] rounded-[28px] bg-[#e8e5dc]" />
            <div className="space-y-5"><div className="h-16 rounded bg-[#e8e5dc]" /><div className="h-44 rounded-[28px] bg-[#e8e5dc]" /><div className="h-44 rounded-[28px] bg-[#e8e5dc]" /></div>
          </div>
        </div>
      </main>
    );
  }

  if (!animal) return null;

  const features = Array.isArray(animal.features) ? animal.features : [];

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#17231e]">
      <header className="sticky top-0 z-20 border-b border-[#dfe3dc] bg-[#f7f4ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link to="/dashboard/" className="flex items-center gap-3 text-sm font-bold tracking-[0.16em]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#0d211b] text-white">LC</span>LIVESTOCK COPILOT</Link>
          <div className="flex items-center gap-3">
            <button onClick={() => void loadAnimal()} className="grid h-10 w-10 place-items-center rounded-full border border-[#ccd4cd]" aria-label="Refresh"><RefreshCw className="h-4 w-4" /></button>
            <Link to="/dashboard/" className="hidden items-center gap-2 text-sm text-[#637269] sm:flex"><ArrowLeft className="h-4 w-4" /> Farm</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6b3f]">Digital animal identity</p>
            <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.04em] sm:text-6xl">{animal.animal_code}</h1>
            <p className="mt-3 text-[#637269]">Saved from Livestock Copilot AI analysis.</p>
          </div>
          <Link to="/dashboard/analyze" className="inline-flex items-center gap-2 rounded-full bg-[#d89a45] px-5 py-3 text-sm font-bold"><Camera className="h-4 w-4" /> Analyze another</Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="overflow-hidden rounded-[30px] bg-[#10251e] shadow-[0_20px_70px_rgba(13,33,27,.12)]">
            {imageUrl ? <img src={imageUrl} alt={`${animal.breed || animal.animal_type} ${animal.animal_code}`} className="h-[520px] w-full object-cover" /> : <div className="grid h-[520px] place-items-center text-[#aabbb0]">Animal image unavailable</div>}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-5 text-white">
              <div><p className="text-xs uppercase tracking-[0.16em] text-[#8fa097]">Species</p><p className="mt-1 font-serif text-2xl">{animal.animal_type}</p></div>
              <div className="text-right"><p className="text-xs uppercase tracking-[0.16em] text-[#8fa097]">AI confidence</p><p className="mt-1 text-2xl font-semibold">{animal.confidence == null ? "—" : `${animal.confidence.toFixed(1)}%`}</p></div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#dfe3dc] bg-white p-7 shadow-[0_16px_55px_rgba(13,33,27,.06)]">
              <div className="flex items-start justify-between gap-5">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6b3f]">Predicted breed</p><h2 className="mt-3 font-serif text-4xl">{animal.breed || "Not available"}</h2></div>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#edf2ed]"><Sparkles className="h-5 w-5 text-[#0d211b]" /></span>
              </div>
              {animal.analysis_explanation && <p className="mt-6 leading-7 text-[#637269]">{animal.analysis_explanation}</p>}
              {features.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{features.map((feature) => <span key={feature} className="rounded-full bg-[#f2f1eb] px-3 py-2 text-xs font-medium text-[#536159]">{feature}</span>)}</div>}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#dfe3dc] bg-white p-6"><Milk className="h-5 w-5 text-[#8b6b3f]" /><p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#87938b]">Milk tracking</p><p className="mt-2 font-serif text-2xl">Ready to record</p><p className="mt-2 text-sm leading-6 text-[#637269]">Connect daily production to this animal.</p></div>
              <div className="rounded-[24px] border border-[#dfe3dc] bg-white p-6"><HeartPulse className="h-5 w-5 text-[#8b6b3f]" /><p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#87938b]">Health</p><p className="mt-2 font-serif text-2xl">No records yet</p><p className="mt-2 text-sm leading-6 text-[#637269]">Keep observations and care history here.</p></div>
              <div className="rounded-[24px] border border-[#dfe3dc] bg-white p-6"><Wheat className="h-5 w-5 text-[#8b6b3f]" /><p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#87938b]">Feed</p><p className="mt-2 font-serif text-2xl">Not recorded</p><p className="mt-2 text-sm leading-6 text-[#637269]">Add feed information when ready.</p></div>
              <div className="rounded-[24px] border border-[#dfe3dc] bg-white p-6"><CalendarDays className="h-5 w-5 text-[#8b6b3f]" /><p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#87938b]">Timeline</p><p className="mt-2 font-serif text-2xl">{new Date(animal.created_at).toLocaleDateString()}</p><p className="mt-2 text-sm leading-6 text-[#637269]">First saved to your farm.</p></div>
            </section>

            <section className="rounded-[28px] bg-[#0d211b] p-7 text-white sm:p-8">
              <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10"><Sparkles className="h-5 w-5 text-[#d89a45]" /></span><div><p className="text-xs uppercase tracking-[0.18em] text-[#aabbb0]">Next step</p><h3 className="mt-2 font-serif text-3xl">Make this animal useful to your farm.</h3><p className="mt-3 max-w-xl leading-7 text-[#b8c6be]">Record milk, health observations, feed, and breeding events over time. Your Copilot can then use this history to answer questions about {animal.animal_code}.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => toast.info("Milk tracking is the next module to connect.")} className="inline-flex items-center gap-2 rounded-full bg-[#d89a45] px-5 py-3 text-sm font-bold text-[#17231e]"><Milk className="h-4 w-4" /> Record milk</button><button onClick={() => toast.info("Health tracking is the next module to connect.")} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold"><HeartPulse className="h-4 w-4" /> Add health note</button></div></div></div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
