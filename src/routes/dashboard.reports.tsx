import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FileBarChart, Download } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ title: "Reports — CattleAI" }] }),
  component: ReportsPage,
});

const data = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  accuracy: 92 + Math.sin(i / 3) * 3 + Math.random() * 2,
  volume: 40 + Math.random() * 60,
}));

function ReportsPage() {
  return (
    <DashboardShell title="Reports">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileBarChart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Monthly Performance</h2>
              <p className="text-xs text-muted-foreground">Accuracy and volume across the last 30 days</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => toast.success("Report exported (demo)")}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Accuracy Trend</h3>
            <div className="mt-3 h-72">
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis domain={[85, 100]} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#2563EB" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Prediction Volume</h3>
            <div className="mt-3 h-72">
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Line type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
