import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary/70 backdrop-blur-sm" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6">
            START
          </h1>
          <p className="text-2xl md:text-3xl text-primary-foreground/90 mb-4">
            Fisioterapia Ortopédica e Esportiva
          </p>
          <p className="text-xl text-primary-foreground/80 mb-12">
            Sistema de Gestão e Avaliação de Pacientes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
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
