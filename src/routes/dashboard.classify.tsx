import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  ImageIcon,
  X,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Calendar,
  Cpu,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { classifyImage, type ClassifyResult } from "@/lib/classify.functions";

export const Route = createFileRoute("/dashboard/classify")({
  head: () => ({ meta: [{ title: "Image Classification — CattleAI" }] }),
  component: ClassifyPage,
});

const MODEL_VERSION = "cattleai-vision-v3 (gemini-2.5-flash)";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function assessQuality(file: File): Promise<{
  width: number;
  height: number;
  brightness: number;
  sharpness: number;
  warnings: string[];
}> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const w = img.naturalWidth,
      h = img.naturalHeight;
    const canvas = document.createElement("canvas");
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let sum = 0;
    const gray = new Float32Array(size * size);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray[p] = v;
      sum += v;
    }
    const brightness = sum / (size * size) / 255; // 0..1
    // Laplacian variance for sharpness
    let mean = 0;
    const lap = new Float32Array(size * size);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const i = y * size + x;
        const v =
          -gray[i - 1] -
          gray[i + 1] -
          gray[i - size] -
          gray[i + size] +
          4 * gray[i];
        lap[i] = v;
        mean += v;
      }
    }
    mean /= size * size;
    let variance = 0;
    for (let i = 0; i < lap.length; i++) variance += (lap[i] - mean) ** 2;
    variance /= lap.length;
    const sharpness = variance; // higher = sharper

    const warnings: string[] = [];
    if (w < 400 || h < 400) warnings.push("Low resolution — upload a larger image for better accuracy.");
    if (brightness < 0.2) warnings.push("Image looks too dark.");
    if (brightness > 0.92) warnings.push("Image looks overexposed.");
    if (sharpness < 40) warnings.push("Image appears blurry.");
    return { width: w, height: h, brightness, sharpness, warnings };
  } finally {
    URL.revokeObjectURL(url);
  }
}

type StoredPrediction = {
  id: string;
  timestamp: string;
  thumbnail: string;
  animal_type: string;
  breed: string;
  confidence: number;
};

function saveToHistory(entry: StoredPrediction) {
  try {
    const raw = localStorage.getItem("cattleai:history");
    const arr: StoredPrediction[] = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    localStorage.setItem("cattleai:history", JSON.stringify(arr.slice(0, 100)));
  } catch {
    /* ignore */
  }
}

function ConfidenceGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const size = 160;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color = clamped >= 85 ? "hsl(var(--secondary))" : clamped >= 65 ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-3xl font-bold">{clamped.toFixed(1)}%</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Confidence</div>
        </div>
      </div>
    </div>
  );
}

function ClassifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<string>("");
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [processingMs, setProcessingMs] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<string>("");
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const classifyFn = useServerFn(classifyImage);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Only JPG, PNG, or WEBP images are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setFile(f);
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));

    try {
      const q = await assessQuality(f);
      setQualityWarnings(q.warnings);
      if (q.warnings.length) toast.warning(q.warnings[0]);
    } catch {
      setQualityWarnings([]);
    }
  }, [previewUrl]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const phases = [
      { at: 0, label: "Preparing image..." },
      { at: 20, label: "Validating content..." },
      { at: 50, label: "Analyzing visual features..." },
      { at: 75, label: "Identifying breed..." },
      { at: 92, label: "Finalizing prediction..." },
    ];
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + (p < 60 ? 3 : p < 85 ? 1.2 : 0.4);
        const cur = phases.filter((ph) => next >= ph.at).pop();
        if (cur) setPhase(cur.label);
        return Math.min(next, 95);
      });
    }, 180);
    return () => clearInterval(id);
  }, [loading]);

  const classify = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const start = performance.now();
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = (await classifyFn({ data: { imageDataUrl: dataUrl } })) as ClassifyResult;
      const elapsed = performance.now() - start;
      setProcessingMs(elapsed);
      setProgress(100);
      setPhase("Done");
      const now = new Date();
      setTimestamp(now.toLocaleString());
      setResult(res);

      if (res.status === "success") {
        toast.success(`Predicted: ${res.animal_type} — ${res.breed}`);
        saveToHistory({
          id: crypto.randomUUID(),
          timestamp: now.toISOString(),
          thumbnail: dataUrl,
          animal_type: res.animal_type,
          breed: res.breed,
          confidence: res.confidence,
        });
      } else if (res.status === "invalid") {
        toast.error(`Invalid image: ${res.reason}`);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setQualityWarnings([]);
    setProgress(0);
    setPhase("");
  };

  const downloadReport = () => {
    if (!result || result.status !== "success" || !previewUrl) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("CattleAI — Prediction Report", 20, 22);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(timestamp, 20, 29);
    doc.setTextColor(20);

    try {
      doc.addImage(previewUrl, "JPEG", 20, 36, 60, 60);
    } catch {
      /* image add may fail on some formats */
    }

    const startY = 42;
    const x = 90;
    doc.setFontSize(12);
    const rows: Array<[string, string]> = [
      ["Animal Type", result.animal_type],
      ["Breed", result.breed],
      ["Confidence", `${result.confidence.toFixed(2)}%`],
      ["Processing Time", `${processingMs.toFixed(0)} ms`],
      ["Model", MODEL_VERSION],
      ["Timestamp", timestamp],
    ];
    rows.forEach(([k, v], i) => {
      doc.setTextColor(120);
      doc.text(k, x, startY + i * 8);
      doc.setTextColor(20);
      doc.text(v, x + 40, startY + i * 8);
    });

    doc.setFontSize(13);
    doc.text("Why this prediction", 20, 112);
    doc.setFontSize(11);
    const expl = doc.splitTextToSize(result.explanation || "-", 170);
    doc.text(expl, 20, 120);

    if (result.features?.length) {
      doc.setFontSize(13);
      doc.text("Key features", 20, 140);
      doc.setFontSize(11);
      result.features.slice(0, 6).forEach((f, i) => doc.text(`• ${f}`, 24, 148 + i * 7));
    }

    doc.save(`cattleai-report-${Date.now()}.pdf`);
    toast.success("Report downloaded");
  };

  return (
    <DashboardShell title="Image Classification">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upload */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Upload an image</h2>
            <p className="text-sm text-muted-foreground">JPG, PNG or WEBP · up to 10 MB · single animal, clear view</p>

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
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-elegant"
                >
                  <UploadCloud className="h-6 w-6" />
                </motion.div>
                <div className="mt-4 text-center">
                  <div className="font-medium">Drag & drop your image here</div>
                  <div className="text-sm text-muted-foreground">or click to browse</div>
                  <div className="mt-2 text-xs text-muted-foreground">Supported: JPG, PNG, WEBP · Max 10 MB</div>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <div className="mt-5 space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[420px] w-full object-contain bg-muted"
                  />
                  <button
                    onClick={reset}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {loading && (
                    <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
                      <div className="w-64 space-y-3 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-white">
                          <Sparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="text-sm font-medium">{phase || "Analyzing image..."}</div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full gradient-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeOut" }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {progress.toFixed(0)}% · est. {Math.max(1, Math.ceil((100 - progress) / 20))}s remaining
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span className="truncate">{file?.name}</span>
                  <span>· {file ? (file.size / 1024).toFixed(0) : 0} KB</span>
                </div>

                {qualityWarnings.length > 0 && (
                  <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" /> Image quality warnings
                    </div>
                    <ul className="ml-6 mt-1 list-disc text-xs text-yellow-700/90 dark:text-yellow-400/90">
                      {qualityWarnings.map((w) => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={classify}
                    disabled={loading}
                    size="lg"
                    className="gradient-primary text-white shadow-elegant hover:opacity-95"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {loading ? "Classifying..." : "Classify Image"}
                  </Button>
                  <Button variant="outline" size="lg" onClick={reset}>
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
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4 animate-pulse" /> AI scanning image
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                  <div className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
                  <div className="text-xs text-muted-foreground">{phase}</div>
                </div>
              </motion.div>
            ) : result && result.status === "invalid" ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-destructive/40 bg-destructive/5 p-6 shadow-soft"
              >
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-5 w-5" /> Invalid Image
                </div>
                <p className="mt-2 font-display text-xl font-bold">{result.reason}</p>
                {result.details && <p className="mt-1 text-sm text-muted-foreground">{result.details}</p>}
                <p className="mt-4 text-sm text-muted-foreground">
                  Please upload a clear photo of a single cow or buffalo.
                </p>
                <Button variant="outline" className="mt-4" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Try another image
                </Button>
              </motion.div>
            ) : result && result.status === "error" ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-destructive/40 bg-destructive/5 p-6"
              >
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <AlertTriangle className="h-5 w-5" /> Something went wrong
                </div>
                <p className="mt-2 text-sm">{result.message}</p>
              </motion.div>
            ) : result && result.status === "success" ? (
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

                <div className="mt-4 flex items-start gap-4">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Uploaded"
                      className="h-20 w-20 rounded-2xl border border-border object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">📌 Animal Type</div>
                    <div className="font-display text-2xl font-bold">
                      {result.animal_type === "Cow" ? "🐄" : "🐃"} {result.animal_type}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">🐄 Breed</div>
                    <div className="text-lg font-semibold">{result.breed}</div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <ConfidenceGauge value={result.confidence} />
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border p-3">
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Processing</dt>
                    <dd className="font-semibold">{processingMs.toFixed(0)} ms</dd>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Cpu className="h-3 w-3" /> Model</dt>
                    <dd className="font-semibold text-[13px]">{MODEL_VERSION}</dd>
                  </div>
                  <div className="col-span-2 rounded-xl border border-border p-3">
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> Timestamp</dt>
                    <dd className="font-semibold">{timestamp}</dd>
                  </div>
                </dl>

                {(result.explanation || result.features?.length) && (
                  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles className="h-4 w-4" /> Why this prediction
                    </div>
                    {result.explanation && (
                      <p className="mt-2 text-sm text-foreground/80">{result.explanation}</p>
                    )}
                    {result.features?.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {result.features.map((f) => (
                          <li key={f} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs">
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {result.quality?.warnings?.length > 0 && (
                  <div className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-700 dark:text-yellow-400">
                    <div className="flex items-center gap-1 font-medium"><AlertTriangle className="h-3 w-3" /> Notes</div>
                    <ul className="ml-5 mt-1 list-disc">
                      {result.quality.warnings.map((w) => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                )}

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
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a clear photo of a cow or buffalo to get started. Humans, other animals, and unclear images will be rejected.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardShell>
  );
}
