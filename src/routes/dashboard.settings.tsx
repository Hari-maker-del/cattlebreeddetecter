import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — CattleAI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);

  return (
    <DashboardShell title="Settings">
      <div className="mx-auto max-w-2xl space-y-6">
        <Section title="Appearance">
          <Row>
            <div>
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </Row>
        </Section>

        <Section title="Notifications">
          <Row>
            <div>
              <Label>Enable notifications</Label>
              <p className="text-xs text-muted-foreground">Get alerts about your predictions</p>
            </div>
            <Switch checked={notifs} onCheckedChange={setNotifs} />
          </Row>
        </Section>

        <Section title="Language">
          <Row>
            <Label>Preferred language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>

        <Section title="Change Password">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Password updated");
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
            <Button type="submit" className="gradient-primary text-white hover:opacity-95">Update password</Button>
          </form>
        </Section>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4">{children}</div>;
}
