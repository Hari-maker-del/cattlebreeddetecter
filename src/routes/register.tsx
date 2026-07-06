import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Brain, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — CattleAI" },
      { name: "description", content: "Create your CattleAI account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Account created!");
    setLoading(false);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background hero-glow">
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full glass rounded-3xl p-8 shadow-elegant"
        >
          <Link to="/" className="mx-auto flex w-fit items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white shadow-elegant">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">CattleAI</span>
          </Link>
          <h1 className="mt-6 text-center font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Start classifying in seconds</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white shadow-elegant hover:opacity-95">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
