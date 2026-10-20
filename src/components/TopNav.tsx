import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Home, Users, Star, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/patients", label: "Pacientes", icon: Users, end: false },
  { to: "/evaluation", label: "Avaliação", icon: Star, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
  );

const TopNav = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="START — Início">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
            S
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            START<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <Button variant="ghost" size="sm" onClick={logout} className="ml-2 text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <nav className="border-t bg-card px-4 py-3 md:hidden animate-fade-in" aria-label="Principal">
          <div className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-muted">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default TopNav;
