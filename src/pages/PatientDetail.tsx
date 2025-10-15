import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Package, Phone, Activity, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sessionDate, setSessionDate] = useState("");
  const [evolution, setEvolution] = useState("");

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("patient_id", id)
        .order("session_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addSessionMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sessions").insert({
        patient_id: id,
        session_date: sessionDate,
        evolution: evolution,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", id] });
      setSessionDate("");
      setEvolution("");
      toast.success("Sessão registrada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao registrar sessão");
    },
  });

  const handleAddSession = () => {
    if (!sessionDate || !evolution) {
      toast.error("Preencha todos os campos");
      return;
    }
    addSessionMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Paciente não encontrado</h2>
          <Button onClick={() => navigate("/patients")}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/patients")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-elevated animate-fade-in">
            <CardHeader className="bg-gradient-primary text-primary-foreground">
              <CardTitle>Perfil do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-32 w-32 mb-4 border-4 border-primary">
                  <AvatarImage src={patient.photo_url || undefined} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-semibold">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2">{patient.name}</h2>
                <Badge variant="secondary" className="mb-4">
                  <Activity className="h-3 w-3 mr-1" />
                  {patient.pathology}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-accent" />
                  <span className="text-muted-foreground">{patient.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-accent" />
                  <span className="text-muted-foreground">
                    Início: {format(new Date(patient.treatment_start_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-accent" />
                  <span className="text-muted-foreground">{patient.session_package}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-elevated animate-slide-up">
              <CardHeader className="bg-gradient-accent text-accent-foreground">
                <CardTitle>Registrar Nova Sessão</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-date">Data da Sessão</Label>
                    <Input
                      id="session-date"
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="evolution">Evolução</Label>
                    <Textarea
                      id="evolution"
                      value={evolution}
                      onChange={(e) => setEvolution(e.target.value)}
                      placeholder="Descreva a evolução do paciente nesta sessão..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleAddSession}
                    disabled={addSessionMutation.isPending}
                    className="w-full bg-accent hover:opacity-90 transition-opacity"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {addSessionMutation.isPending ? "Salvando..." : "Adicionar Sessão"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevated animate-slide-up">
              <CardHeader>
                <CardTitle>Timeline de Evolução</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <div
                        key={session.id}
                        className="relative pl-8 pb-6 border-l-2 border-primary last:border-0 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                        <div className="bg-card p-4 rounded-lg shadow-card hover:shadow-elevated transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            <span className="font-semibold">
                              {format(new Date(session.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.evolution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma sessão registrada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
