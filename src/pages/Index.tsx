import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, ClipboardList, Star, ArrowRight, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const start = new Date();
      start.setDate(1);
      const [p, s] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase
          .from("sessions")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null)
          .gte("session_date", start.toISOString().slice(0, 10)),
      ]);
      return { patients: p.count ?? 0, sessions: s.count ?? 0 };
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const shortcuts = [
    { label: "Gerenciar Pacientes", desc: "Lista, busca e cadastro", icon: Users, to: "/patients" },
    { label: "Registro de Sessões", desc: "Evolução e frequência", icon: ClipboardList, to: "/patients" },
    { label: "Módulo de Avaliação", desc: "Tela da recepção", icon: Star, to: "/evaluation" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Fisioterapia Ortopédica e Esportiva
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">{greeting}!</h1>
          <p className="mt-2 text-muted-foreground">O que vamos fazer hoje na START?</p>
        </div>
        <Button size="lg" onClick={() => navigate("/patients/new")} className="rounded-xl">
          <UserPlus className="mr-2 h-5 w-5" />
          Novo Paciente
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Pacientes ativos</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary sm:text-4xl">{stats?.patients ?? "—"}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Sessões neste mês</p>
          <p className="mt-1 font-display text-3xl font-bold text-secondary sm:text-4xl">{stats?.sessions ?? "—"}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {shortcuts.map(({ label, desc, icon: Icon, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="group flex items-center gap-4 rounded-2xl bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-col md:items-start md:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-lg font-semibold">{label}</span>
              <span className="block text-sm text-muted-foreground">{desc}</span>
            </span>
            <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1 md:self-end" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
