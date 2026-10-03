import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Camera, PawPrint, RefreshCw, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/animals")({
  head: () => ({ meta: [{ title: "My Animals — Livestock Copilot" }] }),
  component: AnimalsPage,
});

type Animal = { id: string; animal_code: string; animal_type: string; breed: string | null; confidence: number | null; image_path: string | null; created_at: string };

type AnimalCard = Animal & { imageUrl: string | null };

async function signedImage(path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from("animal-images").createSignedUrl(path, 60 * 60);
  return data?.signedUrl || null;
}

function AnimalsPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("animals").select("id,animal_code,animal_type,breed,confidence,image_path,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data || []) as Animal[];
      setAnimals(await Promise.all(rows.map(async (animal) => ({ ...animal, imageUrl: await signedImage(animal.image_path) }))));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't load your animals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAnimals(); }, []);

  const filtered = animals.filter((animal) => `${animal.animal_code} ${animal.animal_type} ${animal.breed || ""}`.toLowerCase().includes(query.toLowerCase().trim()));

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#17231e]">
      <header className="sticky top-0 z-20 border-b border-[#dfe3dc] bg-[#f7f4ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link to="/dashboard/" className="flex items-center gap-3 text-sm font-bold tracking-[0.16em]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#0d211b] text-white">LC</span>LIVESTOCK COPILOT</Link>
          <div className="flex items-center gap-3"><button onClick={() => void loadAnimals()} className="grid h-10 w-10 place-items-center rounded-full border border-[#ccd4cd]" aria-label="Refresh"><RefreshCw className="h-4 w-4" /></button><Link to="/dashboard/analyze" className="inline-flex items-center gap-2 rounded-full bg-[#d89a45] px-4 py-2.5 text-sm font-bold"><Camera className="h-4 w-4" /> Add animal</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6b3f]">Your livestock</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em] sm:text-6xl">My Animals</h1><p className="mt-4 max-w-xl leading-7 text-[#637269]">Every saved animal gets a digital identity that can grow with your farm records.</p></div>
          <div className="relative w-full lg:max-w-sm"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#87938b]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, breed or type" className="w-full rounded-full border border-[#ccd4cd] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#8b6b3f]" /></div>
        </div>

        {loading ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-[390px] animate-pulse rounded-[28px] bg-[#e8e5dc]" />)}</div> : filtered.length === 0 ? <div className="mt-10 rounded-[30px] border border-[#dfe3dc] bg-white p-12 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#edf2ed]"><PawPrint className="h-7 w-7 text-[#0d211b]" /></div><h2 className="mt-6 font-serif text-3xl">{animals.length ? "No animals match that search." : "Your first animal starts here."}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#637269]">Analyze an animal and save it to your farm. The profile will appear here automatically.</p><Link to="/dashboard/analyze" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d89a45] px-5 py-3 text-sm font-bold">Analyze My Animal <ArrowRight className="h-4 w-4" /></Link></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((animal) => <Link key={animal.id} to="/dashboard/animal/$animalId" params={{ animalId: animal.animal_code }} className="group overflow-hidden rounded-[28px] border border-[#dfe3dc] bg-white shadow-[0_16px_50px_rgba(13,33,27,.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(13,33,27,.1)]"><div className="relative h-64 bg-[#10251e]">{animal.imageUrl ? <img src={animal.imageUrl} alt={animal.breed || animal.animal_type} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-[#aabbb0]"><PawPrint className="h-10 w-10" /></div>}<span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">{animal.animal_code}</span></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.15em] text-[#87938b]">{animal.animal_type}</p><h2 className="mt-2 font-serif text-2xl">{animal.breed || "Breed pending"}</h2></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#edf2ed]"><Sparkles className="h-4 w-4" /></span></div><div className="mt-5 flex items-center justify-between border-t border-[#edf0eb] pt-4 text-xs text-[#637269]"><span>{animal.confidence == null ? "Confidence unavailable" : `${animal.confidence.toFixed(1)}% confidence`}</span><span className="inline-flex items-center gap-1 font-semibold text-[#17231e]">View profile <ArrowRight className="h-3.5 w-3.5" /></span></div></div></Link>)}</div>}
      </section>
    </main>
  );
}
