import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mic, Send, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askLivestockCopilot, type CopilotResult } from "@/lib/livestock-copilot";

export const Route = createFileRoute("/dashboard/copilot")({
  head: () => ({ meta: [{ title: "Livestock Copilot" }] }),
  component: LivestockCopilot,
});

const suggestions = [
  "Which animals produced less milk?",
  "Show animals needing attention",
  "What feed did I record recently?",
  "Show my breeding records",
  "How many animals do I have?",
];

function LivestockCopilot() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [error, setError] = useState("");

  const ask = async (value = question) => {
    const text = value.trim();
    if (!text || loading) return;
    setLoading(true);
    setError("");
    setQuestion(text);
    try {
      setResult(await askLivestockCopilot(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "I couldn't read your farm data right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Livestock Copilot">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-7 text-white shadow-elegant sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Ask your farm anything.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            Livestock Copilot answers from your saved animals, milk, health, feed, and breeding records. It does not invent missing farm data.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button key={item} onClick={() => ask(item)} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/85 transition hover:bg-white/15">
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void ask(); }}
                placeholder="Ask about milk, health, feed, breeding, or animals..."
                className="h-12 rounded-2xl pr-12"
                aria-label="Ask Livestock Copilot"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Voice input" title="Voice input coming next">
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <Button onClick={() => void ask()} disabled={!question.trim() || loading} className="h-12 rounded-2xl px-5">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Ask</span>
            </Button>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

          {!result && !loading && !error && (
            <div className="py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-6 w-6" /></div>
              <h3 className="mt-4 font-display text-lg font-semibold">Your farm context is ready.</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Start with a question above. The answer will be based on the records saved for your animals.</p>
            </div>
          )}

          {loading && <div className="flex items-center gap-3 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Reading your farm records...</div>}

          {result && !loading && (
            <div className="mt-6 rounded-3xl bg-muted/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles className="h-4 w-4" /> Copilot insight</div>
              <h3 className="mt-3 font-display text-xl font-bold">{result.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.text}</p>
              {result.data && result.data.length > 0 && (
                <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                  {result.data.map((row, index) => (
                    <div key={`${row.label}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div><div className="text-sm font-semibold">{row.label}</div>{row.detail && <div className="text-xs text-muted-foreground">{row.detail}</div>}</div>
                      <div className="text-sm font-semibold text-primary">{row.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground">For health concerns, Copilot surfaces recorded observations and does not replace veterinary examination.</p>
      </div>
    </DashboardShell>
  );
}
