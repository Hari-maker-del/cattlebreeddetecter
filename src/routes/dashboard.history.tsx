import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "Prediction History — CattleAI" }] }),
  component: HistoryPage,
});

type Row = {
  id: string;
  img: string;
  date: string;
  type: "Cow" | "Buffalo";
  breed: string;
  confidence: number;
};

const rows: Row[] = Array.from({ length: 26 }).map((_, i) => {
  const isCow = i % 3 !== 0;
  const breeds = isCow ? ["Holstein Friesian", "Jersey", "Gir"] : ["Murrah", "Nili-Ravi", "Jaffarabadi"];
  return {
    id: `p-${1000 + i}`,
    img: isCow ? "🐄" : "🐃",
    date: new Date(Date.now() - i * 86400000 * 0.7).toLocaleDateString(),
    type: isCow ? "Cow" : "Buffalo",
    breed: breeds[i % breeds.length],
    confidence: 88 + Math.random() * 11,
  };
});

const pageSize = 8;

function HistoryPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesQ =
        !q || r.breed.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q);
      const matchesF = filter === "all" || r.type.toLowerCase() === filter;
      return matchesQ && matchesF;
    });
  }, [q, filter]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <DashboardShell title="Prediction History">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by breed or ID" className="pl-9" />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="cow">Cow</SelectItem>
              <SelectItem value="buffalo">Buffalo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.success("Exported history as CSV (demo)")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3">Image</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Animal Type</th>
                <th className="pb-3">Breed</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No results found</td></tr>
              ) : paged.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-3"><span className="text-2xl">{r.img}</span></td>
                  <td className="py-3 text-muted-foreground">{r.date}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.type === "Cow" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>{r.type}</span>
                  </td>
                  <td className="py-3">{r.breed}</td>
                  <td className="py-3">{r.confidence.toFixed(1)}%</td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Report downloaded (demo)")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Page {page} of {totalPages} · {filtered.length} results</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
