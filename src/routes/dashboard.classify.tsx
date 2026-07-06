import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, ImageIcon, X, Loader2, Download, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import jsPDF from "jspdf";

export const Route = createFileRoute("/dashboard/classify")({
  head: () => ({ meta: [{ title: "Image Classification — CattleAI" }] }),
  component: ClassifyPage,
});

type Prediction = {
  animal_type: "Cow" | "Buffalo";
  breed: string;
  confidence: number;
  time_ms: number;
  model: string;
  status: "success";
};

function ClassifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(f.type)) {
      toast.error("Only JPG, JPEG, and PNG images are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setFile(f);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const classify = async () => {
    if (!file) return;
    setLoading(true);
    // Simulate API call. Real integration:
    //   const fd = new FormData(); fd.append('image', file);
    //   const res = await axios.post('/predict', fd);
    await new Promise((r) => setTimeout(r, 1500));
    const isCow = Math.random() > 0.4;
    const mockBreeds = isCow
      ? ["Holstein Friesian", "Jersey", "Gir", "Sahiwal"]
      : ["Murrah", "Nili-Ravi", "Jaffarabadi", "Surti"];
    const mock: Prediction = {
      animal_type: isCow ? "Cow" : "Buffalo",
      breed: mockBreeds[Math.floor(Math.random() * mockBreeds.length)],
      confidence: 90 + Math.random() * 9,
      time_ms: 320 + Math.random() * 400,
      model: "cattleai-v2.1",
      status: "success",
    };
    setResult(mock);
    setLoading(false);
    toast.success(`Predicted: ${mock.animal_type} — ${mock.breed}`);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const downloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("CattleAI — Prediction Report", 20, 24);
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(new Date().toLocaleString(), 20, 32);
    doc.setTextColor(20);
    doc.setFontSize(13);
    const lines = [
      `Animal Type: ${result.animal_type}`,
      `Breed: ${result.breed}`,
      `Confidence: ${result.confidence.toFixed(2)}%`,
      `Prediction Time: ${result.time_ms.toFixed(0)} ms`,
      `Model Version: ${result.model}`,
      `Status: ${result.status}`,
    ];
    lines.forEach((l, i) => doc.text(l, 20, 50 + i * 10));
    doc.save("cattleai-report.pdf");
    toast.success("Report downloaded");
  };

  return (
    <DashboardShell title="Image Classification">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upload */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Upload an image</h2>
            <p className="text-sm text-muted-foreground">JPG, JPEG or PNG · up to 10 MB</p>

            {!previewUrl ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
                }`}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-elegant">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="mt-4 text-center">
                  <div className="font-medium">Drag & drop your image here</div>
                  <div className="text-sm text-muted-foreground">or click to browse</div>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-border">
                  <img src={previewUrl} alt="Preview" className="max-h-[420px] w-full object-contain bg-muted" />
                  <button
                    onClick={reset}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span className="truncate">{file?.name}</span>
                  <span>· {file ? (file.size / 1024).toFixed(0) : 0} KB</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={classify} disabled={loading} className="gradient-primary text-white shadow-elegant hover:opacity-95">
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Classifying...</>) : "Classify Image"}
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Upload another
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="space-y-4">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted" />
                  <div className="h-24 w-full animate-pulse rounded-2xl bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-elegant"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-secondary">
                  <CheckCircle2 className="h-4 w-4" /> Prediction complete
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-5xl">{result.animal_type === "Cow" ? "🐄" : "🐃"}</div>
                  <div>
                    <div className="font-display text-2xl font-bold">{result.animal_type}</div>
                    <div className="text-sm text-muted-foreground">{result.breed}</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold">{result.confidence.toFixed(2)}%</span>
                  </div>
                  <Progress value={result.confidence} className="mt-2" />
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border p-3">
                    <dt className="text-xs text-muted-foreground">Time</dt>
                    <dd className="font-semibold">{result.time_ms.toFixed(0)} ms</dd>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <dt className="text-xs text-muted-foreground">Model</dt>
                    <dd className="font-semibold">{result.model}</dd>
                  </div>
                  <div className="rounded-xl border border-border p-3 col-span-2">
                    <dt className="text-xs text-muted-foreground">Status</dt>
                    <dd className="font-semibold capitalize text-secondary">{result.status}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={downloadReport} className="gradient-primary text-white hover:opacity-95">
                    <Download className="mr-2 h-4 w-4" /> Download Report
                  </Button>
                  <Button variant="outline" onClick={reset}>Upload Another</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">No prediction yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Upload an image to get started.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardShell>
  );
}
