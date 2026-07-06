import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ImageIcon, TrendingUp, Target, Upload, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — CattleAI" }] }),
  component: DashboardHome,
});

const stats = [
  { label: "Total Images", value: "12,847", icon: ImageIcon, change: "+12.4%" },
  { label: "Total Predictions", value: "12,714", icon: TrendingUp, change: "+9.1%" },
  { label: "Accuracy", value: "98.7%", icon: Target, change: "+0.3%" },
  { label: "Today's Uploads", value: "184", icon: Upload, change: "+24%" },
];

const chartData = [
  { day: "Mon", cows: 45, buffaloes: 30 },
  { day: "Tue", cows: 52, buffaloes: 38 },
  { day: "Wed", cows: 61, buffaloes: 42 },
  { day: "Thu", cows: 48, buffaloes: 35 },
  { day: "Fri", cows: 70, buffaloes: 55 },
  { day: "Sat", cows: 82, buffaloes: 60 },
  { day: "Sun", cows: 65, buffaloes: 48 },
];

const breedData = [
  { name: "Holstein", value: 35 },
  { name: "Jersey", value: 22 },
  { name: "Murrah", value: 18 },
  { name: "Nili-Ravi", value: 14 },
  { name: "Other", value: 11 },
];

const colors = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

const activity = [
  { user: "You", action: "classified", subject: "cow-102.jpg", breed: "Holstein Friesian", time: "2m ago" },
  { user: "You", action: "exported", subject: "history report", breed: "—", time: "1h ago" },
  { user: "You", action: "classified", subject: "buffalo-77.jpg", breed: "Murrah", time: "3h ago" },
  { user: "You", action: "classified", subject: "cow-091.jpg", breed: "Jersey", time: "Yesterday" },
];

function DashboardHome() {
  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        {/* Hero CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 rounded-3xl gradient-primary p-6 text-white shadow-elegant sm:flex-row sm:items-center"
        >
          <div>
            <h2 className="font-display text-2xl font-bold">Welcome back, Jane 👋</h2>
            <p className="mt-1 text-sm text-white/85">Ready to classify some cattle today?</p>
          </div>
          <Link to="/dashboard/classify">
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              New Classification <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-secondary">{s.change}</span>
              </div>
              <div className="mt-4 font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
            <h3 className="font-display text-lg font-semibold">Classification Statistics</h3>
            <p className="text-xs text-muted-foreground">Weekly classifications</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Legend />
                  <Bar dataKey="cows" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="buffaloes" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg font-semibold">Breed Distribution</h3>
            <p className="text-xs text-muted-foreground">All-time</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breedData} innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {breedData.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Recent Activity</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Breed</th>
                  <th className="pb-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-3 font-medium">{a.user}</td>
                    <td className="py-3 text-muted-foreground">{a.action}</td>
                    <td className="py-3">{a.subject}</td>
                    <td className="py-3">{a.breed}</td>
                    <td className="py-3 text-right text-muted-foreground">{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
