import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Camera, Check, ImagePlus, Loader2, RotateCcw, Save, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { classifyImage, type ClassifyResult } from "@/lib/classify.functions";

export const Route = createFileRoute("/dashboard/analyze")({
  head: () => ({ meta: [{ title: "Analyze My Animal — Livestock Copilot" }] }),
  component: AnalyzeAnimalPage,
});

type SavedAnimal = { id: string; animal_type: string; breed: string; confidence: number; imageDataUrl: string; created_at: string };
const STORAGE_KEY = "livestock-copilot:animals";

function readAnimals(): SavedAnimal[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function persistAnimal(animal: SavedAnimal) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([animal, ...readAnimals()].slice(0, 10)));
}

function AnalyzeAnimalPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [animalId, setAnimalId] = useState<string | null>(null);
  const classifyFn = useServerFn(classifyImage);

  const chooseFile = (next: File | null) => {
    if (!next) return;
    if (!next.type.startsWith("image/")) return void toast.error("Please choose a JPG, PNG, or WEBP image.");
    if (next.size > 10 * 1024 * 1024) return void toast.error("Image must be under 10 MB.");
    setFile(next); setResult(null); setSaved(false); setAnimalId(null); setImageDataUrl(null);
    setPreview(URL.createObjectURL(next));
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
      });
      setImageDataUrl(dataUrl);
      const response = await classifyFn({ data: { imageDataUrl: dataUrl } });
      setResult(response as ClassifyResult);
      if (response.status === "success") toast.success("Animal analyzed successfully");
      else if (response.status === "invalid") toast.error(response.reason);
      else toast.error(response.message);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Analysis failed"); }
    finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setImageDataUrl(null); setResult(null); setSaved(false); setAnimalId(null); };

  const saveCurrentAnimal = () => {
    if (!imageDataUrl || !result || result.status !== "success") return;
    const id = `LV-${Date.now().toString().slice(-6)}`;
    persistAnimal({ id, animal_type: result.animal_type, breed: result.breed, confidence: result.confidence, imageDataUrl, created_at: new Date().toISOString() });
    setAnimalId(id); setSaved(true); toast.success(`${id} saved to your farm`);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#17231e]">
      <header className="sticky top-0 z-20 border-b border-[#dfe3dc] bg-[#f7f4ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <a href="/" className="flex items-center gap-3 text-sm font-bold tracking-[0.16em]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#0d211b] text-white">LC</span>LIVESTOCK COPILOT</a>
          <a href="/" className="inline-flex items-center gap-2 text-sm text-[#637269] hover:text-[#17231e]"><ArrowLeft className="h-4 w-4" /> Back home</a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-16">
        <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6b3f]">Start with one animal</p><h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Show us your animal.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#637269] sm:text-lg">Take a photo or upload one. Livestock Copilot will analyze the image and give you a breed prediction with confidence and visible characteristics.</p></div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[28px] border border-[#dfe3dc] bg-white p-5 shadow-[0_18px_60px_rgba(13,33,27,.08)] sm:p-7">
            {!preview ? <div className="grid min-h-[430px] place-items-center rounded-[22px] border-2 border-dashed border-[#cdd5cd] bg-[#faf9f5] p-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#0d211b] text-white"><ImagePlus className="h-7 w-7" /></div><h2 className="mt-6 text-xl font-semibold">Show it. We’ll analyze it.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#637269]">Use a clear photo with one animal in view for the best result.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-[#d89a45] px-5 py-3 text-sm font-bold"><Upload className="h-4 w-4" /> Upload Photo</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#ccd4cd] px-5 py-3 text-sm font-semibold"><Camera className="h-4 w-4" /> Take Photo<input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => chooseFile(e.target.files?.[0] || null)} /></label></div><p className="mt-5 text-xs text-[#87938b]">JPG, PNG or WEBP · up to 10 MB</p></div></div> : <div><div className="relative overflow-hidden rounded-[22px] bg-[#10251e]"><img src={preview} alt="Animal selected for analysis" className="max-h-[520px] min-h-[360px] w-full object-contain" /><button onClick={reset} aria-label="Remove image" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur"><X className="h-5 w-5" /></button></div>{!result && !loading && <button onClick={analyze} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0d211b] px-5 py-4 font-semibold text-white"><Sparkles className="h-5 w-5" /> Analyze My Animal</button>}{loading && <div className="mt-5 flex items-center justify-center gap-3 rounded-full bg-[#0d211b] px-5 py-4 font-semibold text-white"><Loader2 className="h-5 w-5 animate-spin" /> Understanding your animal…</div>}{result?.status === "invalid" && <div className="mt-5 rounded-2xl border border-[#ead6b7] bg-[#fff9ed] p-5"><p className="font-semibold">We couldn’t confidently analyze this image.</p><p className="mt-1 text-sm text-[#637269]">{result.reason}. Try a clearer photo with one animal visible.</p><button onClick={reset} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#cdd5cd] px-4 py-2 text-sm font-semibold"><RotateCcw className="h-4 w-4" /> Try another photo</button></div>}</div>}
          </div>

          <div className="rounded-[28px] bg-[#0d211b] p-7 text-white sm:p-9"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#aabbb0]">AI analysis</p>
            {!result && !loading && <div className="flex min-h-[430px] items-center"><div><h2 className="font-serif text-4xl leading-tight">Your result will appear here.</h2><p className="mt-5 max-w-md leading-7 text-[#b8c6be]">We’ll identify the animal type, estimate the breed, show confidence, and explain the visible features behind the prediction.</p><div className="mt-8 space-y-3 text-sm text-[#d8e1dc]"><div className="flex items-center gap-3"><Check className="h-4 w-4 text-[#d89a45]" /> Animal type</div><div className="flex items-center gap-3"><Check className="h-4 w-4 text-[#d89a45]" /> Breed prediction</div><div className="flex items-center gap-3"><Check className="h-4 w-4 text-[#d89a45]" /> Confidence score</div><div className="flex items-center gap-3"><Check className="h-4 w-4 text-[#d89a45]" /> Visible characteristics</div></div></div></div>}
            {loading && <div className="flex min-h-[430px] items-center"><div><Loader2 className="h-10 w-10 animate-spin text-[#d89a45]" /><h2 className="mt-6 font-serif text-4xl">Understanding the image.</h2><p className="mt-4 text-[#b8c6be]">Checking the animal, visual features, and breed characteristics.</p></div></div>}
            {result?.status === "success" && <div className="pt-8"><div className="rounded-2xl border border-white/10 bg-white/[.05] p-5"><p className="text-sm text-[#aabbb0]">Animal detected</p><h2 className="mt-2 font-serif text-4xl">{result.animal_type}</h2><div className="mt-6 grid grid-cols-2 gap-3"><div><p className="text-xs text-[#8fa097]">Predicted breed</p><p className="mt-1 text-lg font-semibold">{result.breed}</p></div><div><p className="text-xs text-[#8fa097]">Confidence</p><p className="mt-1 text-lg font-semibold">{result.confidence.toFixed(1)}%</p></div></div></div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#aabbb0]">Why this prediction</p><p className="mt-2 leading-7 text-[#d8e1dc]">{result.explanation}</p></div><div className="mt-5 flex flex-wrap gap-2">{result.features.map((feature) => <span key={feature} className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2 text-xs text-[#d8e1dc]">{feature}</span>)}</div>{result.quality.warnings.length > 0 && <div className="mt-5 rounded-2xl border border-[#d89a45]/30 bg-[#d89a45]/10 p-4 text-sm text-[#f0d2a5]">Image quality note: {result.quality.warnings.join(" ")}</div>}<button disabled={saved} onClick={saveCurrentAnimal} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#d89a45] px-5 py-4 font-bold text-[#17231e] disabled:cursor-default disabled:opacity-70">{saved ? <><Check className="h-5 w-5" /> Saved to My Farm</> : <><Save className="h-5 w-5" /> Save My Animal</>}</button></div>}
            {result?.status === "error" && <div className="flex min-h-[430px] items-center"><div><h2 className="font-serif text-4xl">AI is unavailable.</h2><p className="mt-4 text-[#b8c6be]">{result.message}</p><button onClick={reset} className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-semibold"><RotateCcw className="h-4 w-4" /> Try again</button></div></div>}
          </div>
        </div>

        {saved && result?.status === "success" && imageDataUrl && <section className="mt-10 overflow-hidden rounded-[28px] border border-[#dfe3dc] bg-white shadow-[0_18px_60px_rgba(13,33,27,.06)]"><div className="grid lg:grid-cols-[280px_1fr]"><img src={imageDataUrl} alt="Saved animal" className="h-full min-h-[280px] w-full object-cover" /><div className="p-7 sm:p-9"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6b3f]">Digital animal identity</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-4xl">{animalId}</h2><p className="mt-1 text-[#637269]">{result.animal_type} · {result.breed}</p></div><span className="rounded-full bg-[#e9f0e9] px-3 py-2 text-xs font-semibold text-[#31523d]">Saved to My Farm</span></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#f7f4ec] p-4"><p className="text-xs text-[#7a877f]">Breed confidence</p><p className="mt-1 text-xl font-semibold">{result.confidence.toFixed(1)}%</p></div><div className="rounded-2xl bg-[#f7f4ec] p-4"><p className="text-xs text-[#7a877f]">Health records</p><p className="mt-1 text-xl font-semibold">Not started</p></div><div className="rounded-2xl bg-[#f7f4ec] p-4"><p className="text-xs text-[#7a877f]">Milk tracking</p><p className="mt-1 text-xl font-semibold">Not started</p></div></div><p className="mt-6 text-sm leading-6 text-[#637269]">This is the first layer of the animal profile. Next we’ll connect this identity to milk, health, feed, vaccination, breeding, and Copilot history.</p></div></div></section>}
      </section>
    </main>
  );
}
