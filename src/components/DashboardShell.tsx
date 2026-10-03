import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, ImageIcon, History, FileBarChart, User, Settings, LogOut, Brain, Search, Bell, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/analyze", label: "Analyze Animal", icon: ImageIcon },
  { to: "/dashboard/animals", label: "My Animals", icon: Brain },
  { to: "/dashboard/copilot", label: "Livestock Copilot", icon: Sparkles },
  { to: "/dashboard/history", label: "Prediction History", icon: History },
  { to: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const logout = () => { toast.success("Logged out"); navigate({ to: "/" }); };
  return <div className="min-h-dvh bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block"><SidebarContent pathname={pathname} onLogout={logout} /></aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-xl"><SidebarContent pathname={pathname} onLogout={logout} onClose={() => setOpen(false)} /></aside></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6"><button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button><h1 className="min-w-0 truncate font-display text-lg font-semibold">{title}</h1><div className="ml-auto flex items-center gap-2 sm:gap-3"><div className="relative hidden sm:block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="w-64 pl-9" /></div><Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary" /></Button><div className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-sm font-semibold text-white">JD</div></div></header><main className="p-4 sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}

function SidebarContent({ pathname, onLogout, onClose }: { pathname: string; onLogout: () => void; onClose?: () => void }) {
  return <div className="flex h-full flex-col"><div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5"><Link to="/" className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white shadow-elegant"><Brain className="h-5 w-5" /></div><span className="font-display text-lg font-bold">LivestockAI</span></Link>{onClose && <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>}</div><nav className="flex-1 space-y-1 overflow-y-auto p-3">{nav.map((item) => { const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(`${item.to}/`)); return <Link key={item.to} to={item.to} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "gradient-primary text-white shadow-elegant" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}><item.icon className="h-4 w-4" />{item.label}</Link>; })}</nav><div className="border-t border-sidebar-border p-3"><button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-destructive"><LogOut className="h-4 w-4" />Logout</button></div></div>;
}
