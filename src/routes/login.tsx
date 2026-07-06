import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Brain, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — CattleAI" },
      { name: "description", content: "Sign in to your CattleAI account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Welcome back!");
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
          <h1 className="mt-6 text-center font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Sign in to continue to your dashboard</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" required placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white shadow-elegant hover:opacity-95">
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="relative my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" type="button" onClick={() => toast("Google auth is not wired up in this demo.")}>
            <svg viewBox="0 0 48 48" className="mr-2 h-4 w-4"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
