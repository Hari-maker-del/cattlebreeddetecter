import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — CattleAI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane@cattleai.dev",
    institution: "Bovine Research Institute",
    role: "Senior Researcher",
  });

  return (
    <DashboardShell title="Profile">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-primary font-display text-2xl font-bold text-white shadow-elegant">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-bold">{profile.name}</h2>
                <p className="truncate text-sm text-muted-foreground">{profile.role} · {profile.institution}</p>
              </div>
            </div>
            <Button
              variant={editing ? "default" : "outline"}
              className={editing ? "gradient-primary text-white hover:opacity-95" : ""}
              onClick={() => {
                if (editing) toast.success("Profile updated");
                setEditing(!editing);
              }}
            >
              {editing ? <><Save className="mr-2 h-4 w-4" /> Save</> : <><Pencil className="mr-2 h-4 w-4" /> Edit Profile</>}
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(["name", "email", "institution", "role"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={k} className="capitalize">{k}</Label>
                <Input
                  id={k}
                  value={profile[k]}
                  disabled={!editing}
                  onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
