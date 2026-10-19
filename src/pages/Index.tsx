import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Star, LogOut } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast.success("Sessão encerrada com sucesso");
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center py-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary/70 backdrop-blur-sm" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="absolute top-4 right-4 z-20 bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-background/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
        
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 md:mb-6">
            START
          </h1>
          <p className="text-xl md:text-3xl text-primary-foreground/90 mb-3 md:mb-4">
            Fisioterapia Ortopédica e Esportiva
          </p>
          <p className="text-base md:text-xl text-primary-foreground/80 mb-8 md:mb-12">
            Sistema de Gestão e Avaliação de Pacientes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-16 [&>button]:h-20 md:[&>button]:h-32">
            <Button
              size="lg"
              onClick={() => navigate("/patients")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-32 flex flex-col gap-3 text-lg animate-scale-in"
            >
              <Users className="h-10 w-10" />
              Gerenciar Pacientes
            </Button>
            
            <Button
              size="lg"
              onClick={() => navigate("/patients")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-32 flex flex-col gap-3 text-lg animate-scale-in"
              style={{ animationDelay: "100ms" }}
            >
              <ClipboardList className="h-10 w-10" />
              Registro de Sessões
            </Button>
            
            <Button
              size="lg"
              onClick={() => navigate("/evaluation")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-32 flex flex-col gap-3 text-lg animate-scale-in shadow-elevated"
              style={{ animationDelay: "200ms" }}
            >
              <Star className="h-10 w-10" />
              Módulo de Avaliação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
